const fs = require('fs');
const fsPromise = require('fs').promises;
const { google } = require('googleapis');
const path = require('path');
const { PICTURES_PATH } = require('../constants/multerConstants');
const { BadRequestError } = require('../utils/errorTypes');
const sgMail = require('@sendgrid/mail');
const { getEmailBody } = require('./utils/emailTemplateSelector');
const { sendSlackMessage } = require('./thirdPartyApis/slackApi');
const taskAssignees = require('../models/taskAssignees');
const userNotificationSettings = require('../models/userNotificationSettings');

class BaseService {
  constructor(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack) {
    this.models = models;
    this.sequelize = sequelize;
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;
    this.clientBaseUrl = clientBaseUrl;
    this.slack = slack;
    this.tokens;
    this.notificationRedirectsLinks = {
      Task: `/tasks?selected=`,
      Position: `/position/board/`,
      Pool: `/pool/board/`,
    };
    this.systemEmailTemplates;
  }
  initalize = async (fetchGoogleOauthClient) => {
    this.systemEmailTemplate = await this.models.notifications.findAll({
      where: {
        NotificationCategoryID: 1,
      },
    });
    if (fetchGoogleOauthClient) {
      const content = await fsPromise.readFile(
        path.join(process.cwd(), this.CREDENTIALS_PATH)
      );
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;
      const oauth2Client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        key.redirect_uris[0]
      );
      this.googleOauthClient = oauth2Client;
    }
    this.tokens = await this.models.thirdPartyAPITokens.findAll();
  };
  getTokensFromLocalCache = async (thirdPartyApiID, userId) => {
    // get cached tokens from server memory
    let value = this.tokens.find(
      (row) =>
        row.ThirdPartyApiID === thirdPartyApiID &&
        row.UserID === parseInt(userId) &&
        row.IsDeleted === false
    );
    if (!value) {
      // if not in cache then refetch from db and check
      await this.initalize(false);
      value = this.tokens.find(
        (row) =>
          row.ThirdPartyApiID === thirdPartyApiID &&
          row.UserID === parseInt(userId) &&
          row.IsDeleted === false
      );
      if (!value) {
        // if not present even after db fetch that means integration not done
        if (thirdPartyApiID === 1)
          throw new BadRequestError('Google Integration not done by this user');
        if (thirdPartyApiID === 2)
          throw new BadRequestError('Zoom Integration not done by this user');
        if (thirdPartyApiID === 3)
          throw new BadRequestError('Slack Integration not done by this user');
      }
    }
    return value;
  };
  replacePlaceholders = (message, replacements) => {
    const regex = /{(.*?)}/g;
    const replacedMessage = message.replace(regex, (match, key) => {
      if (replacements.hasOwnProperty(key)) {
        return replacements[key];
      }
      return match;
    });
    return replacedMessage;
  };
  sendEmail = async (message) => {
    return new Promise((resolve, reject) => {
      sgMail.setApiKey(this.apiKey);
      sgMail
        .send(message)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  getAllUsersFromHiringTeam = async (jobId) => {
    const jobHiringTeam = await this.models.jobHiringTeam.findAll({
      include: [
        {
          required: false,
          model: this.models.teams,
          include: [
            {
              required: true,
              model: this.models.teamMembers,
              include: [
                {
                  required: true,
                  model: this.models.users,
                  where: {
                    IsDeleted: false,
                  },
                },
              ],
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
        {
          model: this.models.users,
        },
        {
          attributes: ['ID', 'Title', 'CreatedBy'],
          model: this.models.jobs,
        },
      ],
      where: {
        JobID: jobId,
        IsDeleted: false,
      },
    });

    const hiringTeamMembersData = [];
    for (const member of jobHiringTeam) {
      if (member.User) {
        hiringTeamMembersData.push({
          UserID: member.User.ID,
          Email: member.User.EmailAddress,
          PictureURL: member.User.PictureURL,
          Name: member.User.Name,
        });
      }
      if (member.Team) {
        for (const teamMember of member.Team.TeamMembers) {
          if (
            !hiringTeamMembersData.some(
              (hiringMember) => hiringMember.UserID === teamMember.User.ID
            )
          ) {
            hiringTeamMembersData.push({
              UserID: teamMember.User.ID,
              Email: teamMember.User.EmailAddress,
              PictureURL: teamMember.User.PictureURL,
            Name: teamMember.User.Name,
          });
          }
        }
      }
    }
    return hiringTeamMembersData;
  };
  createScheduledTaskPendingNotification = async () => {
    const notificaitonName = 'Task Due'; // make sure db has the exact name for this notification
    const pendingTasksData = await this.models.tasks.findAll({
      include: [
        {
          model: this.models.taskAssignees,
          include: [
            {
              model: this.models.users,
              include: [
                {
                  model: this.models.userNotificationSettings,
                  include: [
                    {
                      model: this.models.notifications,
                      include: [{ model: this.models.notificationCategories }],
                      where: {
                        Name: notificaitonName,
                      },
                    },
                  ],
                },
              ],
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
      ],
      where: {
        TaskStatusID: 1,
      },
    });
    const userNotificationMap = [];
    let notificationMessage = null;
    for (const task of pendingTasksData) {
      for (const taskAssignee of task.TaskAssignees) {
        if (!notificationMessage) {
          notificationMessage =
            taskAssignee.User.UserNotificationSettings[0].Notification.Title;
        }
        if (
          taskAssignee.User.UserNotificationSettings &&
          taskAssignee.User.UserNotificationSettings.length > 0
        ) {
          if (
            taskAssignee.User.UserNotificationSettings[0]
              .SendEmailNotification ||
            taskAssignee.User.UserNotificationSettings[0]
              .SendAlertNotification ||
            taskAssignee.User.UserNotificationSettings[0].SendSlackNotification
          ) {
            if (
              !userNotificationMap.some(
                (row) => row.UserID === taskAssignee.User.ID
              )
            ) {
              userNotificationMap.push({
                NotificationCategoryId:
                  taskAssignee.User.UserNotificationSettings[0].Notification
                    .NotificationCategory.ID,
                UserID: taskAssignee.User.ID,
                UserName: taskAssignee.User.Name,
                Email: taskAssignee.User.EmailAddress,
                TasksList: [task.Title],
                SenderEmail:
                  taskAssignee.User.UserNotificationSettings[0].Notification
                    .NotificationCategory.SenderEmail,
                SendEmailNotification:
                  taskAssignee.User.UserNotificationSettings[0]
                    .SendEmailNotification,
                SendAlertNotification:
                  taskAssignee.User.UserNotificationSettings[0]
                    .SendAlertNotification,
                SendSlackNotification:
                  taskAssignee.User.UserNotificationSettings[0]
                    .SendSlackNotification,
              });
            } else {
              userNotificationMap.forEach((row) => {
                if (row.UserID === taskAssignee.User.ID) {
                  row.TasksList.push(task.Title);
                }
              });
            }
          }
        }
      }
    }

    const notificationPromises = [];
    for (const map of userNotificationMap) {
      const preparedMessage = this.replacePlaceholders(
        notificationMessage,
        map
      );
      if (map.SendEmailNotification) {
        notificationPromises.push(
          this.createNotificationEmail(
            map.Email,
            map.SenderEmail,
            notificaitonName,
            preparedMessage
          )
        );
      }
      if (map.SendAlertNotification) {
        notificationPromises.push(
          this.createUserAlert(map, preparedMessage, map.NotificationCategoryId)
        );
      }
      if (map.SendSlackNotification) {
        //  notificationPromises.push(
        //    this.sendSlackNotification(obj.UserID, preparedMessage)
        //  );
      }
    }
    await Promise.all(notificationPromises);
  };

  createScheduledInterviewReminderNotification = async () => {};
  createUserAlert = async (
    messageReplacementsMap,
    message,
    notificationCategoryId,
    notificationUrl = null
  ) => {
    await this.models.userNotifications.create({
      UserID: messageReplacementsMap.UserID,
      NotificationCategoryID: notificationCategoryId,
      NotificationURL: notificationUrl,
      CreatedDate: Date.now(),
      Message: message,
    });
  };
  createNotificationEmail = async (
    email,
    emailSender,
    subject,
    notificationMessage
  ) => {
    sgMail.setApiKey(this.apiKey);
    let message;
    message = {
      to: email,
      from: emailSender,
      subject,
      html: getEmailBody('Notification', this.apiBaseUrl, this.clientBaseUrl, {
        notificationMessage,
      }),
    };
    await this.sendEmail(message);
  };
  createSystemNotificationEmail = async (
    keyMapList,
    emailSender,
    subject,
    notificationMessage
  ) => {
    sgMail.setApiKey(this.apiKey);
    const emailBody = this.replacePlaceholders(notificationMessage, keyMapList);
    let message;
    message = {
      to: keyMapList.email,
      from: emailSender,
      subject,
      html: emailBody,
    };
    await this.sendEmail(message);
  };
  sendSlackNotification = async ({ userId, message }) => {
    let value = await this.getTokensFromLocalCache(3, userId);
    await sendSlackMessage(
      this.decryptToken(value.Token),
      value.IntegrationID,
      message
    );
    return {
      success: true,
    };
  };
  createNotification = async (
    notificationCategoryId,
    keysMapList,
    notificationName,
    notificationUrl = null
  ) => {
    const NotificationsData = await this.models.notificationCategories.findOne({
      attributes: ['ID', 'Title', 'SenderEmail'],
      include: [
        {
          attributes: ['ID', 'Name', 'NotificationCategoryID', 'Title'],
          model: this.models.notifications,
          include: [
            {
              required: false,
              attributes: [
                'ID',
                'UserID',
                'NotificationID',
                'SendEmailNotification',
                'SendAlertNotification',
                'SendSlackNotification',
              ],
              model: this.models.userNotificationSettings,
            },
          ],
        },
      ],
      where: {
        ID: notificationCategoryId,
      },
    });
    if (notificationCategoryId !== 1) {
      // all notifications except system generated ones
      for (const obj of keysMapList) {
        const notificationExists = NotificationsData.Notifications.find(
          (notification) => {
            return notification.dataValues.Name === notificationName;
          }
        );
        if (notificationExists) {
          const userExists = notificationExists.UserNotificationSettings.find(
            (setting) => setting.UserID === obj.UserID
          );
          if (userExists) {
            const preparedMessage = this.replacePlaceholders(
              notificationExists.Title,
              obj
            );
            const notificationMethods = [];
            if (userExists.SendEmailNotification) {
              notificationMethods.push(
                this.createNotificationEmail(
                  obj.Email,
                  NotificationsData.SenderEmail,
                  notificationName,
                  preparedMessage
                )
              );
            }
            if (userExists.SendAlertNotification) {
              notificationMethods.push(
                this.createUserAlert(
                  obj,
                  preparedMessage,
                  notificationCategoryId,
                  notificationUrl
                )
              );
            }
            if (userExists.SendSlackNotification) {
              // notificationMethods.push(
              //   this.sendSlackNotification(obj.UserID, preparedMessage)
              // );
            }
            await Promise.all(notificationMethods);
          }
        }
      }
    } else {
      const templateData = this.systemEmailTemplate.find(
        (template) => template.Name === notificationName
      );
      if (templateData) {
        keysMapList.title = templateData.Title;
        await this.createSystemNotificationEmail(
          keysMapList,
          NotificationsData.SenderEmail,
          templateData.Name,
          templateData.Description
        );
      }
    }
  };
}

module.exports = BaseService;

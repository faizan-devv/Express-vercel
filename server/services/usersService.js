require('sequelize');
const BaseService = require('./baseService');
const qs = require('qs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs');
const { NotFoundError, BadRequestError } = require('../utils/errorTypes');
const { Op } = require('sequelize');
const { verifyEmail } = require('./utils/verifyHelpers');
const { getInvitationHtml } = require('./utils/invitationHtml');
const { google } = require('googleapis');
const calendar = google.calendar('v3');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const fsPromise = require('fs').promises;
const { getEmailBody } = require('./utils/emailTemplateSelector');
const {
  getZoomToken,
  setZoomMeeting,
  deleteZoomMeeting,
  updateZoomMeeting,
  refreshZoomToken,
  revokeZoomToken,
} = require('./thirdPartyApis/zoomApi');
const {
  getSlackToken,
  sendSlackMessage,
} = require('./thirdPartyApis/slackApi');
const { formatDate } = require('./utils/datetimeHelpers');

class UsersService extends BaseService {
  constructor(
    models,
    sequelize,
    secret,
    apiKey,
    url,
    resetUrl,
    senderEmail,
    passwordExpirationTimeMS,
    apiBaseUrl,
    CREDENTIALS_PATH,
    API_TOKEN_ENCRYPTION_KEY,
    ENCRYPTION_IV,
    clientBaseUrl,
    zoom,
    slack
  ) {
    super(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack);
    this.secret = secret;
    this.apiKey = apiKey;
    this.url = url;
    this.resetUrl = resetUrl;
    this.senderEmail = senderEmail;
    this.passwordExpirationTimeMS = passwordExpirationTimeMS;
    this.apiBaseUrl = apiBaseUrl;
    this.CREDENTIALS_PATH = CREDENTIALS_PATH;
    this.API_TOKEN_ENCRYPTION_KEY = API_TOKEN_ENCRYPTION_KEY;
    this.ENCRYPTION_IV = ENCRYPTION_IV;
    this.clientBaseUrl = clientBaseUrl;
    this.zoom = zoom;
    this.slack = slack;
    this.googleOauthClient;
  }

  generateHash = async () => {
    const token = await crypto.randomBytes(32).toString('hex');
    let hash = crypto.createHash('sha256').update(token).digest('base64');
    hash = hash.split('/').join(''); // we need to remove forward slashes as they can interfer in routing of application
    return hash;
  };

  fetchTimeZones = async () => {
    const timezones = await this.models.timezones.findAll();
    return {
      timezones,
      success: true,
    };
  };

  createInvitedUser = async ({
    fullname,
    password,
    confirmPassword,
    invitationHash,
  }) => {
    const user = await this.models.users.findOne({
      where: { InvitationHash: invitationHash, IsDeleted: false },
    });
    if (!user)
      throw new NotFoundError(
        'Invitation hash is invalid or invitation was canceled'
      );
    if (password !== confirmPassword)
      throw new NotFoundError('Password and Confirm Password are not the same');
    let emails = [];
    const adminUser = await this.models.users.findOne({
      include: [
        {
          required: true,
          attributes: ['ID', 'Name'],
          model: this.models.roles,
          where: {
            Name: 'Administrator',
          },
        },
      ],
      where: {
        CompanyID: parseInt(user.CompanyID),
      },
    });
    const inviteeUser = await this.models.users.findOne({
      where: {
        ID: parseInt(user.InvitedUserID),
      },
    });
    emails.push(user.EmailAddress);
    emails.push(inviteeUser.EmailAddress);
    const userInTeam = await this.models.teamMembers.findOne({
      include: [
        {
          model: this.models.teams,
        },
      ],
      where: {
        UserID: parseInt(user.ID),
        IsDeleted: false,
      },
    });
    if (userInTeam) {
      const teamMembers = await this.models.teamMembers.findAll({
        include: [
          {
            required: true,
            model: this.models.users,
          },
        ],
        where: {
          TeamID: parseInt(userInTeam.TeamID),
          UserID: { [Op.ne]: parseInt(user.ID) },
          IsDeleted: false,
        },
      });
      if (teamMembers && teamMembers.length > 0) {
        teamMembers.forEach((member) => {
          emails.push(member.User.EmailAddress);
        });
      }
    }
    await this.sequelize.transaction(async (t) => {
      const updateUserObject = {
        Name: fullname,
        IsVerified: true,
        IsDeleted: false,
        PasswordHash: await bcrypt.hash(password, 12),
      };
      await this.models.users.update(updateUserObject, {
        where: { ID: user.ID },
        transaction: t,
      });
      emails = Array.from(new Set(emails));
      try {
        sgMail.setApiKey(this.apiKey);
        let message;
        if (!userInTeam) {
          message = {
            to: emails,
            from: this.senderEmail,
            subject: 'ExactCareers Signup',
            html: getEmailBody(
              'acceptInvitation',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                userName: user.Name,
              }
            ),
          };
        } else {
          message = {
            to: emails,
            from: this.senderEmail,
            subject: 'ExactCareers Signup',
            html: getEmailBody(
              'acceptInvitationTeam',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                userName: user.Name,
                teamName: userInTeam.Team.Name,
              }
            ),
          };
        }
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
      const keyMapList = [
        {
          UserID: parseInt(adminUser.ID),
          UserName: fullname,
          Email: adminUser.EmailAddress,
        },
      ];
      await this.createNotification(2, keyMapList, 'New User In Company Added');
    });
    return {
      success: true,
    };
  };

  createUser = async ({
    name,
    email,
    password,
    companyName,
    websiteUrl,
    numberOfEmployees,
    timezoneId,
  }) => {
    const userExist = await this.models.users.findOne({
      where: { EmailAddress: email },
    });
    if (userExist) throw new BadRequestError('User Already Exists');

    const companyExists = await this.models.companies.findOne({
      where: {
        [Op.or]: [{ Name: companyName }, { WebsiteURL: websiteUrl }],
      },
    });
    if (companyExists) throw new BadRequestError('Company Already Exists');

    const transactionResult = await this.sequelize.transaction(async (t) => {
      const company = await this.models.companies.create(
        {
          Name: companyName,
          TotalEmployees: numberOfEmployees,
          WebsiteURL: websiteUrl,
          TimeZoneID: timezoneId,
        },
        {
          transaction: t,
        }
      );
      company.CompanyURL = company.ID + '-' + companyName.replace(/ /g, '-');
      await company.save({ transaction: t });

      const companyPricingPlans = await this.models.companyPricingPlans.create(
        {
          PricingPlanID: 3,
          CompanyID: parseInt(company.ID),
          IsDeleted: 0,
        },
        {
          transaction: t,
        }
      );

      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      let datetime = new Date();
      datetime.setHours(datetime.getHours() + 1);
      const user = await this.models.users.create(
        {
          EmailAddress: email,
          PasswordHash: await bcrypt.hash(password, 12),
          CompanyID: company.ID,
          Name: name,
          VerificationCode: verificationCode,
          ExpirationDate: datetime,
        },
        {
          transaction: t,
        }
      );
      const currentDate = Date.now();
      const role = await this.models.roles.create(
        {
          Name: 'Administrator',
          Description: 'Admin role for the company',
          CompanyID: parseInt(company.ID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
        },
        { transaction: t }
      );
      await this.models.users.update(
        {
          RoleID: parseInt(role.ID),
        },
        {
          where: { ID: parseInt(user.ID) },
          transaction: t,
        }
      );
      const sequelizeBulkData = [];
      const selectedSubModulesRights = [
        { RightsID: 1, SubModuleID: 1 },
        { RightsID: 2, SubModuleID: 1 },
        { RightsID: 1, SubModuleID: 2 },
        { RightsID: 2, SubModuleID: 2 },
        { RightsID: 1, SubModuleID: 3 },
        { RightsID: 2, SubModuleID: 3 },
        { RightsID: 1, SubModuleID: 4 },
        { RightsID: 2, SubModuleID: 4 },
        { RightsID: 1, SubModuleID: 5 },
        { RightsID: 2, SubModuleID: 5 },
        { RightsID: 1, SubModuleID: 6 },
        { RightsID: 2, SubModuleID: 6 },
        { RightsID: 1, SubModuleID: 7 },
        { RightsID: 2, SubModuleID: 7 },
        { RightsID: 1, SubModuleID: 8 },
        { RightsID: 2, SubModuleID: 8 },
        { RightsID: 1, SubModuleID: 9 },
        { RightsID: 2, SubModuleID: 9 },
        { RightsID: 1, SubModuleID: 10 },
        { RightsID: 2, SubModuleID: 10 },
        { RightsID: 1, SubModuleID: 11 },
        { RightsID: 2, SubModuleID: 11 },
        { RightsID: 1, SubModuleID: 12 },
        { RightsID: 2, SubModuleID: 12 },
        { RightsID: 1, SubModuleID: 13 },
        { RightsID: 2, SubModuleID: 13 },
        { RightsID: 1, SubModuleID: 14 },
        { RightsID: 2, SubModuleID: 14 },
        { RightsID: 1, SubModuleID: 15 },
        { RightsID: 2, SubModuleID: 15 },
        { RightsID: 1, SubModuleID: 16 },
        { RightsID: 2, SubModuleID: 16 },
        { RightsID: 1, SubModuleID: 17 },
        { RightsID: 2, SubModuleID: 17 },
        { RightsID: 1, SubModuleID: 18 },
        { RightsID: 2, SubModuleID: 18 },
        { RightsID: 1, SubModuleID: 19 },
        { RightsID: 2, SubModuleID: 19 },
        { RightsID: 1, SubModuleID: 20 },
        { RightsID: 2, SubModuleID: 20 },
        { RightsID: 1, SubModuleID: 21 },
        { RightsID: 2, SubModuleID: 21 },
        { RightsID: 1, SubModuleID: 22 },
        { RightsID: 2, SubModuleID: 22 },
        { RightsID: 1, SubModuleID: 23 },
        { RightsID: 2, SubModuleID: 23 },
        { RightsID: 1, SubModuleID: 24 },
        { RightsID: 2, SubModuleID: 24 },
        { RightsID: 1, SubModuleID: 25 },
        { RightsID: 2, SubModuleID: 25 },
        { RightsID: 1, SubModuleID: 26 },
        { RightsID: 2, SubModuleID: 26 },
        { RightsID: 1, SubModuleID: 27 },
        { RightsID: 2, SubModuleID: 27 },
        { RightsID: 1, SubModuleID: 28 },
        { RightsID: 2, SubModuleID: 28 },
        { RightsID: 1, SubModuleID: 29 },
        { RightsID: 2, SubModuleID: 29 },
        { RightsID: 1, SubModuleID: 30 },
        { RightsID: 2, SubModuleID: 30 },
        { RightsID: 1, SubModuleID: 31 },
        { RightsID: 2, SubModuleID: 31 },
        { RightsID: 1, SubModuleID: 32 },
        { RightsID: 2, SubModuleID: 32 },
        { RightsID: 1, SubModuleID: 33 },
        { RightsID: 2, SubModuleID: 33 },
      ];
      for (const item of selectedSubModulesRights) {
        sequelizeBulkData.push({
          RoleID: parseInt(role.ID),
          SubModuleID: parseInt(item.SubModuleID),
          RightsID: parseInt(item.RightsID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
        });
      }
      await this.models.rolesSubModulesRights.bulkCreate(sequelizeBulkData, {
        transaction: t,
      });
      const positionStages = [
        'Missing Stage',
        'Applied',
        'Scheduled Interview',
        'Shortlisted',
        'Evaluated',
        'Disqualified',
        'Hired',
      ];
      const poolStages = [
        'Missing Stage',
        'Default',
        'Available',
        'Not Available',
      ];
      const positionPipeline = await this.models.pipelines.create(
        {
          Name: 'Default',
          CompanyID: parseInt(company.ID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
          PipelineTypeID: 1,
          IsDefault: true,
          Description: 'A default position pipeline for this company',
        },
        { transaction: t }
      );
      const poolPipeline = await this.models.pipelines.create(
        {
          Name: 'Default',
          CompanyID: parseInt(company.ID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
          PipelineTypeID: 2,
          IsDefault: true,
          Description: 'A default pool pipeline for this company',
        },
        { transaction: t }
      );
      let bulkStagesData = [];
      let stagesOrder = 0;
      for (const stage of positionStages) {
        bulkStagesData.push({
          Name: stage,
          StageOrder: stagesOrder,
          PipelineID: parseInt(positionPipeline.ID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
          Description: 'A default stage for default pipeline',
        });
        stagesOrder += 1;
      }
      await this.models.stages.bulkCreate(bulkStagesData, {
        transaction: t,
      });
      stagesOrder = 0;
      bulkStagesData = [];
      for (const stage of poolStages) {
        bulkStagesData.push({
          Name: stage,
          StageOrder: stagesOrder,
          PipelineID: parseInt(poolPipeline.ID),
          CreatedBy: parseInt(user.ID),
          CreatedDate: currentDate,
          Description: 'A default stage for default pipeline',
        });
        stagesOrder += 1;
      }
      await this.models.stages.bulkCreate(bulkStagesData, {
        transaction: t,
      });
      try {
        sgMail.setApiKey(this.apiKey);
        const keyMapList = {
          email,
          apiBaseUrl: this.apiBaseUrl,
          clientBaseUrl: this.clientBaseUrl,
          verificationCode: verificationCode,
        };
        await this.createNotification(1, keyMapList, 'Verify Email User');
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
      return {
        user,
      };
    });
    return {
      success: true,
      userId: transactionResult.user.ID,
      message: 'SignUp Success',
    };
  };

  verifyCode = async ({ newUserId, verificationCode }) => {
    const user = await this.models.users.findOne({
      where: { ID: newUserId },
    });

    if (!user) throw new BadRequestError("User Doesn't Exsist");
    if (user.IsVerified === true)
      throw new BadRequestError('User Already Verified');
    if (user.VerificationCode !== verificationCode)
      throw new BadRequestError('Expired or Invalid Code');
    const expirationDate = new Date(user.ExpirationDate);
    const currentDate = new Date();
    if (expirationDate.getTime() < currentDate.getTime()) {
      throw new BadRequestError('Code Expired');
    }
    await this.sequelize.transaction(async (t) => {
      const setUserObject = {
        IsVerified: 1,
      };
      await this.models.users.update(setUserObject, {
        where: { ID: user.ID },
        transaction: t,
      });
      try {
        sgMail.setApiKey(this.apiKey);
        const message = {
          to: user.EmailAddress,
          from: this.senderEmail,
          subject: 'Welcome to ExactCareers',
          html: getEmailBody('welcome', this.apiBaseUrl, this.clientBaseUrl, {
            userName: user.Name,
          }),
        };
        await this.sendEmail(message);
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
    });
    return {
      success: true,
    };
  };

  resendCode = async ({ newUserId }) => {
    const user = await this.models.users.findOne({
      where: { ID: newUserId },
    });
    if (!user) throw new BadRequestError("User Doesn't Exsist");
    if (user.IsVerified === 1)
      throw new BadRequestError('User Already Verified');
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    let datetime = new Date();
    datetime.setHours(datetime.getHours() + 1);
    await this.sequelize.transaction(async (t) => {
      const setUserObject = {
        VerificationCode: verificationCode,
        ExpirationDate: datetime,
      };
      await this.models.users.update(setUserObject, {
        where: { ID: user.ID },
        transaction: t,
      });
      try {
        sgMail.setApiKey(this.apiKey);
        const message = {
          to: user.EmailAddress,
          from: this.senderEmail,
          subject: 'ExactCareers Signup',
          html: getEmailBody(
            'emailVerification',
            this.apiBaseUrl,
            this.clientBaseUrl,
            {
              verificationCode: verificationCode,
            }
          ),
        };
        await this.sendEmail(message);
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
    });

    return {
      success: true,
    };
  };

  loginUser = async ({ email, password }, cache) => {
    const user = await this.models.users.findOne({
      where: { EmailAddress: email },
      include: [
        {
          model: this.models.companies,
          attributes: ['Name', 'PictureURL'],
        },
        {
          model: this.models.roles,
        },
      ],
    });
    if (!user) {
      throw new NotFoundError('Incorrect work email or password.');
    }
    if (!user.IsVerified)
      throw new BadRequestError('User is not verified:' + user.ID);
    if (user.IsDeleted) throw new NotFoundError('This user has been deleted');
    const isValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isValid) {
      throw new BadRequestError('Incorrect work email or password.');
    }
    const RoleRightsData = await this.models.modules.findAll({
      attributes: ['ID', 'Name'],
      include: [
        {
          attributes: ['ID', 'Name'],
          model: this.models.subModules,
          include: [
            {
              attributes: ['ID', 'RightsID', 'RoleID', 'SubModuleID'],
              model: this.models.rolesSubModulesRights,
              include: [
                {
                  attributes: ['ID', 'Name'],
                  model: this.models.rights,
                },
              ],
              where: {
                RoleID: parseInt(user.RoleID),
              },
            },
          ],
        },
      ],
    });
    const token = await jwt.sign(
      { email: email, userId: user.ID },
      this.secret,
      { expiresIn: '8h' }
    );
    const pipelinesData = await this.models.pipelines.findAll({
      where: {
        CompanyID: parseInt(user.CompanyID),
        PipelineTypeID: [1, 2],
        IsDefault: true,
      },
    });
    let defaultPoolPipelineID;
    let defaultPositionPipelineID;
    for (const data of pipelinesData) {
      if (data.PipelineTypeID === 1) {
        defaultPositionPipelineID = parseInt(data.ID);
      }
      if (data.PipelineTypeID === 2) {
        defaultPoolPipelineID = parseInt(data.ID);
      }
    }
    const transformedRightsData = RoleRightsData.map((module) => {
      return {
        id: module.ID,
        name: module.Name,
        subModules: module.SubModules.map((submodule) => {
          let isViewEnabled = false;
          let isModifyEnabled = false;
          for (const right of submodule.RoleSubModuleRights) {
            if (right.RightsID === 1) isViewEnabled = true;
            if (right.RightsID === 2) isModifyEnabled = true;
          }
          return {
            id: submodule.ID,
            name: submodule.Name,
            permissions: {
              view: isViewEnabled,
              modify: isModifyEnabled,
            },
          };
        }).sort((a, b) => {
          return a.id - b.id;
        }),
      };
    });

    cache.addPermissions({
      [parseInt(user.ID)]: {
        name: user.Role.Name,
        RoleRightsData: transformedRightsData,
      },
    });

    return {
      token,
      userId: user.ID,
      Name: user.Name,
      EmailAddress: user.EmailAddress,
      PictureURL: user.PictureURL || '',
      CompanyId: user.CompanyID,
      CompanyName: user.Company.Name,
      status: user.IsVerified,
      CompanyPictureURL: user.Company.PictureURL || '',
      defaultPoolPipelineID,
      defaultPositionPipelineID,
      RoleName: user.Role.Name,
      RoleRightsData,
      success: true,
    };
  };

  deleteInvitation = async ({ email, companyId, userId }) => {
    const invitedUser = await this.models.users.findOne({
      attributes: ['ID'],
      where: { EmailAddress: email, CompanyID: companyId },
    });
    if (!invitedUser) {
      throw new NotFoundError('Invited user does not exist');
    }
    if (invitedUser.IsVerified) {
      throw new NotFoundError('This user has already verified themselves');
    }
    await this.models.users.update(
      {
        ModifiedDate: Date.now(),
        ModifiedBy: userId,
        IsDeleted: true,
      },
      {
        where: { ID: invitedUser.ID },
      }
    );
    return {
      success: true,
    };
  };

  fetchUserRolesTeams = async ({ companyId }) => {
    const usersData = await this.models.users.findAll({
      attributes: ['ID', 'Name', 'EmailAddress', 'PictureURL'],
      include: [
        {
          model: this.models.roles,
        },
        {
          attributes: ['ID', 'TeamID', 'UserID'],
          model: this.models.teamMembers,
          include: [
            {
              attributes: ['ID', 'Name'],
              model: this.models.teams,
            },
          ],
        },
      ],
      where: {
        CompanyID: companyId,
        IsVerified: true,
        IsDeleted: false,
      },
    });
    const users = await this.models.users.findAll({
      attributes: [
        'ID',
        'CompanyID',
        'EmailAddress',
        'IsVerified',
        'CreatedDate',
        'InvitedUserId',
        'IsDeleted',
      ],
      include: [
        {
          attributes: ['ID', 'Name', 'EmailAddress'],
          model: this.models.users,
          as: 'InvitedByUser',
        },
      ],
      where: {
        CompanyID: companyId,
        IsVerified: 0,
        IsDeleted: false,
        InvitedUserId: {
          [Op.ne]: null,
        },
      },
    });
    return {
      pendingInvites: users,
      members: usersData,
      success: true,
    };
  };

  resendInvitation = async ({ userId, companyId, email }) => {
    sgMail.setApiKey(this.apiKey);
    const hash = await this.generateHash();
    const invitedUser = await this.models.users.findOne({
      where: { EmailAddress: email, CompanyID: companyId },
    });
    await this.models.users.update(
      {
        EmailAddress: email,
        CompanyID: companyId,
        InvitedUserID: userId,
        InvitationDate: Date.now(),
        InvitationHash: hash,
      },
      { where: { ID: parseInt(invitedUser.ID) } }
    );
    const message = {
      to: email,
      from: this.senderEmail,
      subject: 'ExactCareers Invitation',
      html: getInvitationHtml(this.url, hash),
    };
    message.to = email;
    message.html = getEmailBody(
      'teamInvite',
      this.apiBaseUrl,
      this.clientBaseUrl,
      {
        inviteUserUrl: this.url,
        hash: hash,
      }
    );
    await this.sendEmail(message);
    return {
      success: true,
      user: invitedUser,
    };
  };

  fetchPendingInvites = async ({ companyId }) => {
    const users = await this.models.users.findAll({
      attributes: [
        'ID',
        'CompanyID',
        'EmailAddress',
        'IsVerified',
        'CreatedDate',
        'InvitedUserId',
        'IsDeleted',
      ],
      include: [
        {
          attributes: ['ID', 'Name'],
          model: this.models.users,
          as: 'InvitedByUser',
        },
      ],
      where: {
        CompanyID: companyId,
        IsVerified: 0,
        IsDeleted: false,
        InvitedUserId: {
          [Op.ne]: null,
        },
      },
    });
    return {
      users,
      success: true,
    };
  };

  updateUserTeam = async ({ userId, memberId, teams }) => {
    const User = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    const UserCurrentTeams = await this.models.teamMembers.findAll({
      attributes: ['TeamID'],
      where: {
        UserID: memberId,
      },
    });
    const currentTeamIds = [];
    for (const team of UserCurrentTeams) {
      currentTeamIds.push(parseInt(team.TeamID));
    }
    const newTeamsIds = [];
    const deletedTeamsIds = [];
    for (const id of currentTeamIds) {
      if (!teams.includes(id)) {
        deletedTeamsIds.push(id);
      }
    }
    for (const id of teams) {
      if (!currentTeamIds.includes(parseInt(id))) {
        newTeamsIds.push(id);
      }
    }
    const emailsMapperObject = {};
    const teamNames = [];
    for (const teamId of newTeamsIds) {
      const emails = [];
      const teamMembers = await this.models.teamMembers.findAll({
        include: [
          {
            required: true,
            model: this.models.users,
            where: {
              IsDeleted: false,
            },
          },
          {
            required: true,
            model: this.models.teams,
            where: {
              IsDeleted: false,
            },
          },
        ],
        where: {
          TeamID: parseInt(teamId),
        },
      });
      const teams = await this.models.teams.findOne({
        where: {
          ID: teamId,
        },
      });
      teamNames.push(teams.Name);
      if (teamMembers && teamMembers.length > 0) {
        teamMembers.forEach((member) => {
          emails.push(member.User.EmailAddress);
        });
        emailsMapperObject[teamMembers[0].Team.Name] = emails;
      }
    }
    await this.sequelize.transaction(async (t) => {
      if (deletedTeamsIds.length > 0) {
        await this.models.teamMembers.destroy({
          where: {
            UserID: memberId,
            TeamID: deletedTeamsIds,
          },
          transaction: t,
        });
      }
      const seqeulizebulkData = [];
      for (const id of newTeamsIds) {
        seqeulizebulkData.push({
          TeamID: parseInt(id),
          UserID: parseInt(memberId),
          CreatedDate: Date.now(),
          CreatedBy: userId,
        });
      }
      await this.models.teamMembers.bulkCreate(seqeulizebulkData, {
        transaction: t,
      });
      sgMail.setApiKey(this.apiKey);
      try {
        for (const key in emailsMapperObject) {
          const message = {
            to: emailsMapperObject[key],
            from: this.senderEmail,
            subject: 'Team Member Added',
            html: getEmailBody(
              'teamAssigned',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                userName: User.Name,
                teamName: key,
              }
            ),
          };
          await this.sendEmail(message);
        }
        if (teamNames.length > 0) {
          const message = {
            to: User.EmailAddress,
            from: this.senderEmail,
            subject: 'Added To Team or Teams',
            html: getEmailBody(
              'userTeamAssigned',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                userName: User.Name,
                teamsList: teamNames,
              }
            ),
          };
          await this.sendEmail(message);
        }
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
    });
    return {
      success: true,
    };
  };
  sendInvitation = async ({ userId, companyId, email, roleId, teams }) => {
    sgMail.setApiKey(this.apiKey);
    if (!verifyEmail(email)) {
      throw new BadRequestError(
        `${email} is an invalid email. Request will not be processed`
      );
    }
    const hash = await this.generateHash();
    const newUser = await this.models.users.findOne({
      // we dont allow invitation for a user that exists in any company already
      where: { EmailAddress: email, IsDeleted: false },
    });
    const userIsDeleted = await this.models.users.findOne({
      where: { EmailAddress: email, CompanyID: companyId, IsDeleted: true },
    });
    if (newUser) {
      throw new BadRequestError('User already invited or exists');
    }
    if (!newUser) {
      const message = {
        to: email,
        from: this.senderEmail,
        subject: 'ExactCareers Invitation',
        html: getInvitationHtml(this.url, hash),
      };
      message.to = email;
      message.html = getEmailBody(
        'teamInvite',
        this.apiBaseUrl,
        this.clientBaseUrl,
        {
          inviteUserUrl: this.url,
          hash: hash,
        }
      );
      await this.sendEmail(message);
      // const keyMapList = {
      //   email,
      //   apiBaseUrl: this.apiBaseUrl,
      //   clientBaseUrl: this.clientBaseUrl,
      //   inviteUserUrl: this.url,
      //   hash: hash,
      // };
      //await this.createNotification(1, keyMapList, 'Verify Email User');
      const currentDate = Date.now();
      await this.sequelize.transaction(async (t) => {
        let invitedUser;
        if (!userIsDeleted) {
          invitedUser = await this.models.users.create(
            {
              EmailAddress: email,
              CompanyID: companyId,
              RoleID: roleId,
              InvitedUserID: userId,
              InvitationDate: currentDate,
              InvitationHash: hash,
              IsVerified: false,
            },
            { transaction: t }
          );
        } else {
          invitedUser = await this.models.users.update(
            {
              EmailAddress: email,
              CompanyID: companyId,
              RoleID: roleId,
              InvitedUserID: userId,
              InvitationDate: currentDate,
              InvitationHash: hash,
              IsVerified: false,
              IsDeleted: false,
            },
            { where: { ID: parseInt(userIsDeleted.ID) }, transaction: t }
          );
          invitedUser = {};
          invitedUser.ID = userIsDeleted.ID;
        }
        if (teams && teams.length > 0) {
          const sequelizeTeamMembersBulkData = [];
          for (const teamId of teams) {
            sequelizeTeamMembersBulkData.push({
              TeamID: parseInt(teamId),
              UserID: parseInt(invitedUser.ID),
              CreatedDate: currentDate,
              CreatedBy: userId,
            });
          }
          await this.models.teamMembers.bulkCreate(
            sequelizeTeamMembersBulkData,
            {
              transaction: t,
            }
          );
        }
      });
    }
    return {
      success: true,
    };
  };
  updatePassword = async ({
    userId,
    oldPassword,
    newPassword,
    confirmNewPassword,
  }) => {
    const user = await this.models.users.findOne({
      where: { ID: userId },
    });
    if (!user) throw new BadRequestError("User Doesn't Exsist");
    const isValid = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!isValid) {
      throw new BadRequestError('Incorrect Old Password Entered !');
    }
    if (oldPassword === newPassword) {
      throw new BadRequestError(`New Password can't be same as Old Password `);
    }
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestError(
        `New Password is not same as Confirm New Password`
      );
    }
    const updateUserObj = {
      PasswordHash: await bcrypt.hash(newPassword, 12),
    };
    await this.models.users.update(updateUserObj, {
      where: { ID: user.ID },
    });
    return {
      success: true,
    };
  };

  forgotPassword = async ({ email }) => {
    const user = await this.models.users.findOne({
      where: { EmailAddress: email },
    });

    if (!user) {
      throw new NotFoundError(
        'No account associated with this email found. Please recheck or consider creating a new account.'
      );
    }
    const hash = await this.generateHash();
    const updateUserObj = {
      PasswordResetToken: hash,
      PasswordResetExpirationDate: Date.now() + this.passwordExpirationTimeMS, // currently set to 10 minutes in .yaml file
    };

    await this.models.users.update(updateUserObj, {
      where: { ID: user.ID },
    });
    const keyMapList = {
      email,
      apiBaseUrl: this.apiBaseUrl,
      clientBaseUrl: this.clientBaseUrl,
      resetUrl: this.resetUrl,
      hash,
    };
    await this.createNotification(1, keyMapList, 'Forgot Password User');
    // sgMail.setApiKey(this.apiKey);
    // const message = {
    //   to: email,
    //   from: this.senderEmail,
    //   subject: 'ExactCareer Reset Password',
    //   html: getEmailBody(
    //     'forgotPassword',
    //     this.apiBaseUrl,
    //     this.clientBaseUrl,
    //     {
    //       resetUrl: this.resetUrl,
    //       hash,
    //     }
    //   ),
    // };
    // await this.sendEmail(message);
    return {
      success: true,
    };
  };

  updateForgotPassword = async ({ newPassword, confirmPassword, hash }) => {
    if (confirmPassword !== newPassword) {
      throw new BadRequestError('The two entered Passwords do not match !');
    }

    const user = await this.models.users.findOne({
      where: {
        [Op.and]: [
          { PasswordResetToken: hash },
          { PasswordResetExpirationDate: { [Op.gt]: Date.now() } },
        ],
      },
    });

    if (!user) {
      throw new BadRequestError(
        'Hash Token Invalid or Expired, Please Try Again'
      );
    }
    const setUserObject = {
      PasswordHash: await bcrypt.hash(newPassword, 12),
      PasswordResetToken: null,
      PasswordResetExpirationDate: Date.now(),
    };

    await this.models.users.update(setUserObject, {
      where: { ID: user.ID },
    });
    return {
      success: true,
    };
  };

  updateDetails = async (body, picture) => {
    if (picture) {
      body.PictureURL = '/users/' + picture.filename;
    }
    if (body.EmailAddress)
      throw new BadRequestError('User Email cannot be updated !');
    await this.models.users.update(body, {
      where: { ID: body.ID },
    });
    const user = await this.models.users.findOne({
      where: { ID: body.ID },
    });
    return {
      user,
      success: true,
    };
  };

  updateUserRole = async ({ companyUserId, roleId }) => {
    const updateUserObject = {
      RoleID: roleId,
    };
    await this.models.users.update(updateUserObject, {
      where: { ID: companyUserId },
    });
    return {
      success: true,
    };
  };

  deleteUser = async ({ userId }) => {
    const updateUserObject = {
      IsDeleted: true,
      IsActive: false,
      IsVerified: false,
    };
    await this.sequelize.transaction(async (t) => {
      await this.models.users.update(updateUserObject, {
        where: { ID: userId },
        transaction: t,
      });
      await this.models.teamMembers.update(
        {
          IsDeleted: true,
        },
        {
          where: {
            UserID: userId,
          },
          transaction: t,
        }
      );
      await this.models.jobHiringTeam.update(
        {
          IsDeleted: true,
        },
        {
          where: {
            UserID: userId,
          },
          transaction: t,
        }
      );
    });
    return {
      success: true,
    };
  };

  fetchPaginatedUsersList = async ({ offset, limit, companyId }) => {
    const results = await this.models.users.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: {
        companyID: companyId,
        IsDeleted: false,
      },
    });
    return {
      results,
      success: true,
    };
  };

  createTask = async ({
    userId,
    applicantId,
    jobId,
    usersList,
    title,
    dueDate,
    description,
  }) => {
    if (!usersList) {
      throw new BadRequestError('Task Assigness List was not provided');
    }
    const taskCreator = await this.models.users.findOne({
      attributes: ['ID', 'Name'],
      where: {
        ID: userId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const task = await this.models.tasks.create(
        {
          Title: title,
          DueDate: dueDate,
          Description: description,
          ApplicantID: applicantId,
          JobID: jobId,
          TaskStatusID: 1,
          CreatedBy: userId,
          CreateDate: Date.now(),
        },
        {
          transaction: t,
        }
      );
      const seqeulizebulkData = [];
      const userIds = [];
      for (const user of usersList) {
        seqeulizebulkData.push({
          TaskID: parseInt(task.ID),
          UserID: parseInt(user.ID),
        });
        userIds.push(user.ID);
      }
      await this.models.taskAssignees.bulkCreate(seqeulizebulkData, {
        transaction: t,
      });
      const createdAssigness = await this.models.users.findAll({
        where: {
          ID: userIds,
        },
      });
      const keyMapList = [];
      const createTaskActivity = await this.models.taskActivities.create(
        {
          TaskID: parseInt(task.ID),
          CreatedBy: userId,
          CreatedDate: Date.now(),
        },
        {
          transaction: t,
        }
      );
      sgMail.setApiKey(this.apiKey);
      for (const assigne of createdAssigness) {
        keyMapList.push({
          UserID: parseInt(assigne.ID),
          UserName: taskCreator.Name,
          TaskName: title,
          Email: assigne.EmailAddress,
        });
      }
      await this.createNotification(
        4,
        keyMapList,
        'Task Assigned to You',
        this.notificationRedirectsLinks.Task + task.ID
      );
    });
    return {
      success: true,
    };
  };

  updateTaskStatus = async ({ taskId, taskStatusId, userId }) => {
    const task = await this.models.tasks.findOne({
      include: [
        {
          model: this.models.taskAssignees,
          include: [
            {
              model: this.models.users,
            },
          ],
        },
      ],
      where: {
        ID: taskId,
      },
    });
    const taskAssigne = await this.models.users.findOne({
      where: {
        ID: parseInt(task.CreatedBy),
      },
    });
    const emails = [];
    const keyMapList = [];
    task.TaskAssignees.forEach((assigne) => {
      emails.push(assigne.User.EmailAddress);
      keyMapList.push({
        UserID: parseInt(assigne.User.ID),
        UserName: assigne.User.Name,
        TaskName: task.Title,
        Email: assigne.User.EmailAddress,
      });
    });
    if (!emails.includes(taskAssigne.EmailAddress)) {
      emails.push(taskAssigne.EmailAddress);
    }
    await this.sequelize.transaction(async (t) => {
      await this.models.tasks.update(
        {
          TaskStatusID: taskStatusId,
        },
        {
          where: {
            ID: taskId,
          },
          transaction: t,
        }
      );
      const createTaskStatusUpdateActivity =
        await this.models.taskActivities.create(
          {
            TaskID: taskId,
            CreatedBy: userId,
            CreateDate: Date.now(),
            IsCompleted: true,
          },
          {
            transaction: t,
          }
        );
      try {
        sgMail.setApiKey(this.apiKey);
        const message = {
          to: emails,
          from: this.senderEmail,
          subject: 'Task Completed',
          html: getEmailBody(
            'taskCompleted',
            this.apiBaseUrl,
            this.clientBaseUrl,
            {
              taskName: task.Title,
            }
          ),
        };
        await this.sendEmail(message);
        await this.createNotification(
          4,
          keyMapList,
          'Task Marked Completed',
          this.notificationRedirectsLinks.Task + taskId
        );
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
    });
    return {
      success: true,
    };
  };
  updateTask = async (requestBody) => {
    const { ID, userId, usersList, Title } = requestBody;
    if (!usersList) {
      throw new BadRequestError('Task Assigness List was not provided');
    }
    const updatingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    const usersInDb = await this.models.tasks.findOne({
      include: [
        {
          model: this.models.taskAssignees,
        },
      ],
      where: {
        ID: ID,
      },
    });
    const newUsersIds = [];
    usersList.forEach((user) => {
      const userNotExists = !usersInDb.TaskAssignees.some(
        (userDb) => userDb.UserID === user.ID
      );
      if (userNotExists) {
        newUsersIds.push(user.ID);
      }
    });
    const newUsers = await this.models.users.findAll({
      attributes: ['ID', 'EmailAddress'],
      where: {
        ID: newUsersIds,
      },
    });
    const updateTaskObject = Object.fromEntries(
      Object.entries(requestBody).filter(
        ([key]) => key !== 'usersList' && key !== 'ID' && key !== 'userId'
      )
    );
    updateTaskObject['ModifiedBy'] = userId;
    updateTaskObject['ModifiedDate'] = Date.now();
    await this.sequelize.transaction(async (t) => {
      await this.models.tasks.update(updateTaskObject, {
        where: {
          ID: ID,
        },
        transaction: t,
      });
      const seqeulizebulkData = [];
      const keyMapList = [];
      for (const user of newUsers) {
        keyMapList.push({
          UserID: user.ID,
          Email: user.EmailAddress,
          UserName: updatingUser.Name,
          TaskName: Title,
        });
      }
      await this.models.taskAssignees.destroy({
        where: {
          TaskID: ID,
        },
        transaction: t,
      });
      for (const user of usersList) {
        seqeulizebulkData.push({
          TaskID: parseInt(ID),
          UserID: parseInt(user.ID),
        });
      }
      await this.models.taskAssignees.bulkCreate(seqeulizebulkData, {
        transaction: t,
      });
      const createTaskUpdateActivity = await this.models.taskActivities.create(
        {
          TaskID: ID,
          CreatedBy: userId,
          CreatedDate: Date.now(),
        },
        {
          transaction: t,
        }
      );
      if (keyMapList.length > 0) {
        await this.createNotification(
          4,
          keyMapList,
          'Task Assigned to You',
          this.notificationRedirectsLinks.Task + ID
        );
      }
    });
    return {
      success: true,
    };
  };

  deleteTask = async ({ taskId, userId }) => {
    const task = this.models.tasks.findOne({
      where: {
        ID: parseInt(taskId),
      },
    });
    if (!task) {
      throw new BadRequestError('Task does not exist !');
    }
    await this.models.tasks.update(
      {
        IsDeleted: true,
        ModifiedBy: parseInt(userId),
      },
      {
        where: {
          ID: parseInt(taskId),
        },
      }
    );
    return {
      success: true,
    };
  };

  fetchTasks = async ({ userId, filters }) => {
    const candidateTasks = await this.models.tasks.findAll({
      include: [
        {
          required: false,
          model: this.models.taskActivities,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
        {
          required: false,
          model: this.models.tasksStatuses,
        },
        {
          required: false,
          model: this.models.taskAssignees,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
      ],
      where: {
        ApplicantID: filters.applicantId || null,
        IsDeleted: false,
      },
    });
    const createdByUserTasks = await this.models.tasks.findAll({
      include: [
        {
          required: false,
          model: this.models.taskActivities,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
        {
          required: false,
          model: this.models.taskAssignees,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
      ],
      where: {
        CreatedBy: userId,
        IsDeleted: false,
      },
    });
    const assignedToUserTasks = await this.models.tasks.findAll({
      include: [
        {
          required: false,
          model: this.models.taskActivities,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
        {
          required: true,
          model: this.models.taskAssignees,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
          where: {
            UserID: userId,
          },
        },
      ],
      where: {
        CreatedBy: {
          [Op.ne]: userId,
        },
        IsDeleted: false,
      },
    });
    const assignedToUserTasksSelfIncluded = await this.models.tasks.findAll({
      include: [
        {
          required: false,
          model: this.models.taskActivities,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
        {
          required: true,
          model: this.models.taskAssignees,
          include: [
            {
              attributes: ['ID', 'Name', 'PictureURL'],
              required: true,
              model: this.models.users,
              where: {
                IsDeleted: false,
              },
            },
          ],
          where: {
            UserID: userId,
          },
        },
      ],
      where: {
        IsDeleted: false,
      },
    });
    let TasksData = [];
    if (!filters.CreatedByMe && !filters.AssignedToMe && !filters.applicantId) {
      TasksData = [...createdByUserTasks, ...assignedToUserTasks];
    }
    if (filters.applicantId) {
      TasksData = candidateTasks;
    }
    if (filters.CreatedByMe) {
      TasksData = createdByUserTasks;
    }
    if (filters.AssignedToMe) {
      TasksData = assignedToUserTasksSelfIncluded;
    }
    TasksData = TasksData.sort(
      (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
    );
    return {
      TasksData,
      success: true,
    };
  };
  refreshZoomToken = async (userId, refreshToken) => {
    const newToken = await refreshZoomToken(
      this.zoom.OAUTH_ENDPOINT,
      this.zoom.Client_ID,
      this.zoom.Client_Secret,
      refreshToken
    );
    await this.models.thirdPartyAPITokens.update(
      // update the token in db
      {
        Token: this.encryptToken(newToken.access_token),
        RefreshToken: this.encryptToken(newToken.refresh_token),
      },
      {
        where: {
          UserID: userId,
          ThirdPartyApiID: 2,
        },
      }
    );
    await this.initalize(false);
  };
  refreshGoogleToken = async () => {
    const { credentials } = await this.googleOauthClient.refreshAccessToken();
    tokens = { ...credentials, refresh_token: tokens.refresh_token };
    await this.models.thirdPartyAPITokens.update(
      // update the token in db
      {
        Token: this.encryptToken(tokens.access_token),
        RefreshToken: this.encryptToken(tokens.refresh_token),
        TokenExpiryDate: tokens.expiry_date,
      },
      {
        where: {
          UserID: userId,
          ThirdPartyApiID: 1,
        },
      }
    );
    await this.initalize(false);
  };

  encryptToken = (token) => {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.API_TOKEN_ENCRYPTION_KEY, 'hex'),
      Buffer.from(this.ENCRYPTION_IV, 'hex')
    );
    let encrypted = cipher.update(token, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  };

  decryptToken = (encryptedToken) => {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.API_TOKEN_ENCRYPTION_KEY, 'hex'),
      Buffer.from(this.ENCRYPTION_IV, 'hex')
    );
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  };
  slackSignInUrl = async () => {
    return {
      url: `${this.slack.OAUTH_ENDPOINT}?${qs.stringify({
        client_id: this.slack.CLIENT_ID,
        scope: this.slack.BOT_SCOPE,
        user_scope: this.slack.USER_SCOPE,
        redirect_uri: this.slack.REDIRECT_URL,
      })}`,
      success: true,
    };
  };
  zoomSignInUrl = async () => {
    return {
      url: `${this.zoom.ZOOM_OAUTH_AUTHORIZATION_URL}?${qs.stringify({
        response_type: 'code',
        client_id: this.zoom.Client_ID,
        redirect_uri: this.zoom.ZOOM_REDIRECT_URL,
      })}`,
      success: true,
    };
  };
  googleSignInUrl = async () => {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const url = this.googleOauthClient.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
    return {
      url,
      success: true,
    };
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
  slackToken = async ({ code, userId }) => {
    const data = await getSlackToken(
      this.slack.OAUTH_TOKEN,
      this.slack.CLIENT_ID,
      this.slack.CLIENT_SECRET,
      code
    );
    // const access_token = this.encryptToken(data.access_token);
    // const refresh_token = this.encryptToken(data.refresh_token);
    const userToken = await this.models.thirdPartyAPITokens.findOne({
      where: {
        ThirdPartyApiID: 3,
        UserID: userId,
        IsDeleted: false,
      },
    });
    if (!userToken) {
      const access_token = this.encryptToken(data.access_token);
      await this.models.thirdPartyAPITokens.create({
        UserID: userId,
        ThirdPartyApiID: 3,
        IntegrationID: data.authed_user.id,
        Token: access_token,
      });
      await this.initalize(false);
    }
    return {
      success: true,
    };
  };
  googleToken = async ({ code, userId }) => {
    const { tokens } = await this.googleOauthClient.getToken(code);
    this.googleOauthClient.setCredentials(tokens);
    const userToken = await this.models.thirdPartyAPITokens.findOne({
      where: {
        ThirdPartyApiID: 1,
        UserID: userId,
        IsDeleted: false,
      },
    });
    if (!userToken) {
      await this.models.thirdPartyAPITokens.create({
        UserID: userId,
        ThirdPartyApiID: 1,
        Token: this.encryptToken(tokens.access_token),
        RefreshToken: this.encryptToken(tokens.refresh_token),
        TokenExpiryDate: tokens.expiry_date,
      });
      await this.initalize(false);
    }
    return {
      success: true,
    };
  };
  zoomToken = async ({ code, userId }) => {
    const data = await getZoomToken(
      this.zoom.ZOOM_OAUTH_TOKEN_URL,
      this.zoom.ZOOM_REDIRECT_URL,
      this.zoom.Account_ID,
      this.zoom.Client_ID,
      this.zoom.Client_Secret,
      code
    );
    // const access_token = this.encryptToken(data.access_token);
    // const refresh_token = this.encryptToken(data.refresh_token);
    const userToken = await this.models.thirdPartyAPITokens.findOne({
      where: {
        ThirdPartyApiID: 2,
        UserID: userId,
        IsDeleted: false,
      },
    });
    if (!userToken) {
      await this.models.thirdPartyAPITokens.create({
        UserID: userId,
        ThirdPartyApiID: 2,
        Token: this.encryptToken(data.access_token),
        RefreshToken: this.encryptToken(data.refresh_token),
        TokenExpiryDate: data.expires_in,
      });
      await this.initalize(false);
    }
    return {
      success: true,
    };
  };

  setMeeting = async ({
    companyLocation,
    userId,
    applicantId,
    applicantEmail,
    timeZone,
    meetingTypeId,
    meetingOptionId,
    meetingDescription,
    duration,
    title,
    meetingDateTime,
    meetingMembers,
  }) => {
    const currentApplicant = await this.models.applicants.findOne({
      attributes: ['FullName'],
      where: {
        ID: applicantId,
      },
    });
    const meetingCreatingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      const seqeulizebulkData = [];
      const emails = [];
      emails.push(applicantEmail);
      for (const member of meetingMembers) {
        emails.push(member.EmailAddress);
      }
      let createdMeetingData;
      const location =
        meetingTypeId === 2
          ? ' '
          : 'Location: ' + (companyLocation?.AddressLine1 || '');
      let value = this.tokens.find(
        (row) =>
          row.ThirdPartyApiID === 1 &&
          row.UserID === parseInt(userId) &&
          row.IsDeleted === false
      );
      if (
        (meetingOptionId === 1 &&
          (meetingTypeId === 2 || meetingTypeId === 3)) ||
        (value && meetingTypeId === 1)
      ) {
        // google
        value = await this.getTokensFromLocalCache(1, userId);
        this.googleOauthClient.setCredentials({
          access_token: this.decryptToken(value.Token),
          refresh_token: this.decryptToken(value.RefreshToken),
        });
        const googleMeetingBody = {
          client: this.googleOauthClient,
          meetingTypeId,
          userId,
          title,
          meetingDescription: meetingDescription,
          meetingDateTime,
          meetingTimeZone: timeZone.GoogleCalendarName,
          meetingDuration: parseInt(duration.TimeSpan.split(' ')[0]),
          emails,
          location,
        };
        try {
          createdMeetingData = await this.createGoogleEvent(googleMeetingBody);
        } catch (error) {
          if (
            error.message.response.data.message === 'Invalid access token.' ||
            error.message.response.data.code === 124
          ) {
            await this.refreshGoogleToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 1 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            this.googleOauthClient.setCredentials({
              access_token: this.decryptToken(value.Token),
              refresh_token: this.decryptToken(value.RefreshToken),
            });
            googleMeetingBody.client = this.googleOauthClient;
            createdMeetingData = await this.createGoogleEvent(
              googleMeetingBody
            );
          } else {
            throw new BadRequestError('Failed to create Meeting: ' + error);
          }
        }
      }
      if (
        meetingOptionId === 2 &&
        (meetingTypeId === 2 || meetingTypeId === 3)
      ) {
        const emailsObjectArray = [];
        emails.forEach((email) => emailsObjectArray.push({ email }));
        const zoomMeetingBody = {
          agenda: meetingDescription,
          topic: title,
          duration: parseInt(duration.TimeSpan.split(' ')[0]),
          start_time: meetingDateTime,
          timeZone: timeZone.GoogleCalendarName,
          type: 2, // for a scheduled zoom meeting
          settings: {
            join_before_host: true,
            meeting_invitees: emailsObjectArray,
            alternative_hosts_email_notification: true,
            registrants_email_notification: true,
            email_notification: true,
            push_change_to_calendar: true,
            allow_multiple_devices: true,
            // calendar_type: 2, // 2 indicates we push this zoom meeting to google calendar aswell
            private_meeting: false,
          },
        };
        let value = await this.getTokensFromLocalCache(2, userId);
        try {
          createdMeetingData = await setZoomMeeting(
            this.zoom.API_BASE_URL,
            this.decryptToken(value.Token),
            zoomMeetingBody
          );
        } catch (error) {
          if (
            error.message.response.data.message === 'Invalid access token.' ||
            error.message.response.data.code === 124
          ) {
            await this.refreshZoomToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 2 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            createdMeetingData = await setZoomMeeting(
              this.zoom.API_BASE_URL,
              this.decryptToken(value.Token),
              zoomMeetingBody
            );
          } else {
            throw new BadRequestError('Failed to create Meeting: ' + error);
          }
        }
        // email logic here
        try {
          sgMail.setApiKey(this.apiKey);
          const formattedDate = formatDate(meetingDateTime);
          const message = {
            to: emails,
            from: this.senderEmail,
            subject: 'Interview Scheduled',
            html: getEmailBody(
              'createZoomMeeting',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                meetingTitle: title,
                meetingDescription: meetingDescription + '<br><br>' + location,
                meetingDateTime: formattedDate,
                timeZone: timeZone.GoogleCalendarName,
                meetingLink: createdMeetingData.join_url,
              }
            ),
          };
          await this.sendEmail(message);
        } catch (error) {
          throw new BadRequestError('Error while sending email: ' + error);
        }
      }
      const createdMeeting = await this.models.meetings.create(
        {
          CompanyLocationID: parseInt(companyLocation.ID),
          Title: title,
          EventID: createdMeetingData?.id,
          MeetingLink:
            createdMeetingData?.hangoutLink ||
            createdMeetingData?.join_url ||
            null,
          Description: meetingDescription,
          TimeZoneID: parseInt(timeZone.ID),
          MeetingTypeID: meetingTypeId,
          MeetingOptionID: meetingOptionId,
          MeetingStatusID: 1,
          DurationID: parseInt(duration.ID),
          MeetingDateTime: meetingDateTime,
          ApplicantID: applicantId,
          CreatedBy: userId,
          CreateDate: currentDate,
        },
        { transaction: t }
      );
      const keyMapList = [];
      for (const member of meetingMembers) {
        seqeulizebulkData.push({
          MeetingID: parseInt(createdMeeting.ID),
          UserID: parseInt(member.ID),
          CreatedBy: userId,
          CreatedDate: currentDate,
        });
        keyMapList.push({
          UserID: parseInt(member.ID),
          UserName: meetingCreatingUser.Name,
          Email: member.EmailAddress,
          InterviewTitle: title,
          ApplicantName: currentApplicant.FullName,
        });
      }
      await this.models.meetingTeamMembers.bulkCreate(seqeulizebulkData, {
        transaction: t,
      });
      await this.createNotification(6, keyMapList, 'Interview Scheduled');
    });
    return { success: true };
  };

  setTimeAccordingUTC = (meetingDateTime, utc) => {
    const inputDate = new Date(meetingDateTime);
    // Subtract UTC hours
    // inputDate.setHours(inputDate.getHours() + utc); // for Pakistan Time, we need to do it dynamically according to utc
    inputDate.setUTCHours(inputDate.getUTCHours() - 5);

    // Format the resulting date as a string
    const formattedDate = inputDate.toISOString();
    return formattedDate;
  };
  createGoogleEvent = async (body) => {
    const {
      client,
      meetingTypeId,
      userId,
      title,
      meetingDescription: description,
      meetingDateTime,
      meetingTimeZone: timeZone,
      meetingDuration: durationMinutes,
      emails,
      location,
    } = body;
    try {
      let event = {};
      if (meetingTypeId === 1) {
        event = {
          summary: title,
          description: description + '\n\n' + location,
          start: {
            dateTime: meetingDateTime, // hardcoded for Pakistan
            timeZone: timeZone,
          },
          end: {
            dateTime: new Date(
              new Date(meetingDateTime).getTime() + durationMinutes * 60 * 1000
            ),
            timeZone: timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }],
          },
          attendees: emails.map((email) => ({ email })),
        };
        const createdEvent = await calendar.events.insert({
          auth: client,
          calendarId: 'primary',
          resource: event,
          sendUpdates: 'all',
        });
        return createdEvent.data;
      }
      if (meetingTypeId === 2) {
        event = {
          summary: title,
          description: description,
          start: {
            dateTime: meetingDateTime, // hardcoded for Pakistan
            timeZone: timeZone,
          },
          end: {
            dateTime: new Date(
              new Date(meetingDateTime).getTime() + durationMinutes * 60 * 1000
            ),
            timeZone: timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }],
          },
          sendNotifications: true,
          attendees: emails.map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: this.generateUniqueRequestId(), // Provide a unique ID
            },
          },
        };
        const createdEvent = await calendar.events.insert({
          auth: client,
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all',
        });
        return createdEvent.data;
      }
      if (meetingTypeId === 3) {
        event = {
          summary: title,
          description: description + '\n\n' + location,
          start: {
            dateTime: meetingDateTime, // hardcoded for Pakistan
            timeZone: timeZone,
          },
          end: {
            dateTime: new Date(
              new Date(meetingDateTime).getTime() + durationMinutes * 60 * 1000
            ),
            timeZone: timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }],
          },
          sendNotifications: true,
          attendees: emails.map((email) => ({ email })),
          conferenceData: {
            createRequest: {
              requestId: this.generateUniqueRequestId(), // Provide a unique ID
            },
          },
        };
        const createdEvent = await calendar.events.insert({
          auth: client,
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all',
        });
        return createdEvent.data;
      }
    } catch (error) {
      throw new BadRequestError('Error creating google meeting:' + error);
    }
  };
  generateUniqueRequestId = () => {
    const timestamp = new Date().getTime().toString();
    const random = Math.random().toString(36).substring(2, 10); // You can adjust the length as needed
    const uniqueId = `${timestamp}-${random}`;
    return uniqueId;
  };
  showUserAvailability = async ({ userId, date, companyId }) => {
    const userMeetings = await this.models.meetings.findAll({
      attributes: ['MeetingDateTime'],
      include: [
        {
          attributes: ['UserID'],
          required: true,
          model: this.models.meetingTeamMembers,
          where: {
            UserID: userId,
          },
        },
        {
          attributes: ['TimeSpan'],
          model: this.models.durations,
        },
      ],
      where: {
        // CompanyID: companyId,
        MeetingDateTime: {
          [Op.gte]: new Date(date), // Greater than or equal to the start of the day
          [Op.lt]: new Date(date + 'T23:59:59.999Z'), // Less than the end of the day
        },
        IsDeleted: false,
      },
    });
    return { userMeetings, success: true };
  };
  updateMeeting = async (body) => {
    if (!body.meetingMembers) {
      throw new BadRequestError('Meeting members list must be provided');
    }
    const {
      duration,
      meetingMembers,
      timeZone,
      companyLocation,
      userId,
      eventId,
      MeetingTypeID,
      Title,
      Description,
      MeetingDateTime,
      applicantEmail,
      MeetingOptionID,
      ApplicantID,
    } = body;
    const currentApplicant = await this.models.applicants.findOne({
      attributes: ['FullName'],
      where: {
        ID: ApplicantID,
      },
    });
    const meetingCreatingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    let meetingDateTime = MeetingDateTime;
    const updateMeetingObject = Object.fromEntries(
      Object.entries(body).filter(
        ([key]) =>
          key !== 'meetingMembers' &&
          key !== 'companyLocation' &&
          key !== 'duration' &&
          key !== 'applicantEmail' &&
          key !== 'eventId' &&
          key !== 'userId' &&
          key !== 'timeZone'
      )
    );
    (updateMeetingObject['MeetingDateTime'] = meetingDateTime),
      (updateMeetingObject['ModifiedBy'] = userId);
    updateMeetingObject['ModifiedDate'] = Date.now();
    updateMeetingObject['TimeZoneID'] = parseInt(timeZone.ID);
    updateMeetingObject['DurationID'] = parseInt(duration.ID);
    updateMeetingObject['CompanyLocationID'] = parseInt(companyLocation.ID);
    await this.sequelize.transaction(async (t) => {
      const seqeulizebulkData = [];
      const emails = [];
      const keyMapList = [];
      emails.push(applicantEmail);
      const currentDate = Date.now();
      for (const member of meetingMembers) {
        seqeulizebulkData.push({
          MeetingID: parseInt(body.ID),
          UserID: parseInt(member.ID),
          CreatedBy: userId,
          CreatedDate: currentDate,
        });
        keyMapList.push({
          UserID: parseInt(member.ID),
          UserName: meetingCreatingUser.Name,
          Email: member.EmailAddress,
          InterviewTitle: Title,
          ApplicantName: currentApplicant.FullName,
        });
        emails.push(member.EmailAddress);
      }
      let createdMeetingData;
      const location =
        MeetingTypeID === 2
          ? ' '
          : 'Location: ' + (companyLocation?.AddressLine1 || '');
      let value = this.tokens.find(
        (row) =>
          row.ThirdPartyApiID === 1 &&
          row.UserID === parseInt(userId) &&
          row.IsDeleted === false
      );
      if (
        (MeetingOptionID === 1 &&
          (MeetingTypeID === 2 || MeetingTypeID === 3)) ||
        (value && MeetingTypeID === 1)
      ) {
        value = await this.getTokensFromLocalCache(1, userId);
        this.googleOauthClient.setCredentials({
          access_token: this.decryptToken(value.Token),
          refresh_token: this.decryptToken(value.RefreshToken),
        });
        const googleMeetingUpdateBody = {
          client: this.googleOauthClient,
          eventId,
          MeetingTypeID,
          userId,
          Title,
          Description,
          meetingDateTime,
          meetingTimeZone: timeZone.GoogleCalendarName,
          meetingDuration: parseInt(duration.TimeSpan.split(' ')[0]),
          emails,
        };
        try {
          createdMeetingData = await this.updateEvent(googleMeetingUpdateBody);
          updateMeetingObject['EventID'] = createdMeetingData.id;
          updateMeetingObject['MeetingLink'] =
            createdMeetingData.hangoutLink || null;
        } catch (error) {
          if (
            error.message.response?.data?.message === 'Invalid access token.' ||
            error.message.response?.data?.code === 124
          ) {
            await this.refreshGoogleToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 1 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            this.googleOauthClient.setCredentials({
              access_token: this.decryptToken(value.Token),
              refresh_token: this.decryptToken(value.RefreshToken),
            });
            googleMeetingBody.client = this.googleOauthClient;
            createdMeetingData = await this.updateEvent(
              googleMeetingUpdateBody
            );
            updateMeetingObject['EventID'] = createdMeetingData.id;
            updateMeetingObject['MeetingLink'] =
              createdMeetingData.hangoutLink || null;
          } else {
            throw new BadRequestError('Failed to create Meeting: ' + error);
          }
        }
      }
      if (
        MeetingOptionID === 2 &&
        (MeetingTypeID === 2 || MeetingTypeID === 3)
      ) {
        const emailsObjectArray = [];
        emails.forEach((email) => emailsObjectArray.push({ email }));
        const zoomMeetingBody = {
          agenda: Description,
          topic: Title,
          duration: parseInt(duration.TimeSpan.split(' ')[0]),
          start_time: meetingDateTime,
          timeZone: timeZone.GoogleCalendarName,
          type: 2, // for a scheduled zoom meeting
          settings: {
            join_before_host: true,
            meeting_invitees: emailsObjectArray,
            alternative_hosts_email_notification: true,
            registrants_email_notification: true,
            email_notification: true,
            push_change_to_calendar: true,
            allow_multiple_devices: true,
            // calendar_type: 2, // 2 indicates we push this zoom meeting to google calendar aswell
            private_meeting: false,
          },
        };
        let value = await this.getTokensFromLocalCache(2, userId);
        try {
          await updateZoomMeeting(
            this.zoom.API_BASE_URL,
            this.decryptToken(value.Token),
            zoomMeetingBody,
            eventId
          );
        } catch (error) {
          if (
            error.message.response.data.message === 'Invalid access token.' ||
            error.message.response.data.code === 124
          ) {
            await this.refreshZoomToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 2 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            await updateZoomMeeting(
              this.zoom.API_BASE_URL,
              this.decryptToken(value.Token),
              zoomMeetingBody,
              eventId
            );
          } else {
            throw new BadRequestError('Failed to delete Meeting: ' + error);
          }
        }
        const formattedDate = formatDate(meetingDateTime);
        try {
          sgMail.setApiKey(this.apiKey);
          const message = {
            to: emails,
            from: this.senderEmail,
            subject: 'Interview Rescheduled',
            html: getEmailBody(
              'updateZoomMeeting',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                meetingTitle: Title,
                meetingDateTime: formattedDate,
                meetingDescription: Description + '<br><br>' + location,
              }
            ),
          };
          await this.sendEmail(message);
        } catch (error) {
          throw new BadRequestError('Error while sending email: ' + error);
        }
      }
      await this.models.meetings.update(updateMeetingObject, {
        where: {
          ID: parseInt(body.ID),
        },
        transaction: t,
      });
      await this.models.meetingTeamMembers.destroy({
        where: {
          MeetingID: body.ID,
        },
        transaction: t,
      });
      await this.models.meetingTeamMembers.bulkCreate(seqeulizebulkData, {
        transaction: t,
      });
      await this.createNotification(6, keyMapList, 'Interview Updated');
    });
    return { success: true };
  };
  updateEvent = async (body) => {
    const {
      client,
      eventId,
      MeetingTypeID: meetingTypeId,
      Title: title,
      Description: description,
      meetingDateTime,
      meetingTimeZone: timeZone,
      meetingDuration: durationMinutes,
      emails,
    } = body;
    try {
      let event;
      if (meetingTypeId === 1) {
        event = {
          summary: title,
          description: description,
          conferenceData: null,
          start: {
            dateTime: meetingDateTime,
            timeZone: timeZone,
          },
          end: {
            dateTime: new Date(
              new Date(meetingDateTime).getTime() + durationMinutes * 60 * 1000
            ),
            timeZone: timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }],
          },
          sendNotifications: true,
          attendees: emails.map((email) => ({ email })),
        };
        const updatedEvent = await calendar.events.update({
          auth: client,
          calendarId: 'primary',
          eventId: eventId,
          resource: event,
          sendUpdates: 'all',
        });
        return updatedEvent.data;
      } else {
        event = {
          summary: title,
          description: description,
          conferenceData: {
            createRequest: {
              requestId: this.generateUniqueRequestId(),
            },
          },
          start: {
            dateTime: meetingDateTime,
            timeZone: timeZone,
          },
          end: {
            dateTime: new Date(
              new Date(meetingDateTime).getTime() + durationMinutes * 60 * 1000
            ),
            timeZone: timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }],
          },
          sendNotifications: true,
          attendees: emails.map((email) => ({ email })),
        };
      }
      const updatedEvent = await calendar.events.update({
        auth: client,
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });
      return updatedEvent.data;
    } catch (error) {
      throw new BadRequestError('Error updating google event:' + error);
    }
  };
  fetchApplicantMeetings = async ({ applicantId, companyId }) => {
    const applicantMeetings = await this.models.meetings.findAll({
      attributes: [
        'ID',
        'Title',
        'Description',
        'MeetingDateTime',
        'DurationID',
        'EventID',
        'MeetingTypeID',
        'TimeZoneID',
        'MeetingLink',
        'CompanyLocationID',
        'MeetingOptionID',
      ],
      include: [
        {
          attributes: ['UserID'],
          required: true,
          model: this.models.meetingTeamMembers,
          include: [
            {
              attributes: ['Name', 'EmailAddress', 'ID'],
              required: true,
              model: this.models.users,
            },
          ],
        },
        {
          attributes: ['ID', 'TimeSpan'],
          required: true,
          model: this.models.durations,
        },
      ],
      where: {
        ApplicantID: applicantId,
        IsDeleted: false,
      },
      order: [['ID', 'DESC']],
    });
    return { applicantMeetings, success: true };
  };
  deleteMeeting = async ({
    companyId,
    meetingName,
    meetingId,
    applicantId,
    userId,
    eventId,
    meetingOptionId,
  }) => {
    const meetingData = await this.models.meetings.findOne({
      attributes: ['ID', 'Title', 'MeetingTypeID'],
      where: {
        ID: meetingId,
      },
    });
    const meetingCreatingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    const applicant = await this.models.applicants.findOne({
      attributes: ['Email', 'FullName'],
      where: {
        ID: applicantId,
      },
    });
    const usersData = await this.models.meetingTeamMembers.findAll({
      attributes: ['ID', 'UserID'],
      include: [
        {
          required: true,
          attributes: ['EmailAddress'],
          model: this.models.users,
        },
      ],
      where: {
        MeetingID: meetingId,
      },
    });
    const emails = [];
    const keyMapList = [];
    for (const user of usersData) {
      emails.push(user.User.EmailAddress);
      keyMapList.push({
        UserID: parseInt(user.UserID),
        UserName: meetingCreatingUser.Name,
        Email: user.User.EmailAddress,
        InterviewTitle: meetingData.Title,
        ApplicantName: applicant.FullName,
      });
    }
    emails.push(applicant.Email);
    await this.sequelize.transaction(async (t) => {
      if (
        meetingOptionId === 1 &&
        (meetingData.MeetingTypeID === 2 || meetingData.MeetingTypeID === 3)
      ) {
        let value = await this.getTokensFromLocalCache(1, userId);
        this.googleOauthClient.setCredentials({
          access_token: this.decryptToken(value.Token),
          refresh_token: this.decryptToken(value.RefreshToken),
        });
        try {
          await calendar.events.delete({
            auth: this.googleOauthClient,
            calendarId: 'primary',
            eventId: eventId,
            sendUpdates: 'all',
          });
        } catch (error) {
          if (
            error.message.response?.data?.message === 'Invalid access token.' ||
            error.message.response?.data?.code === 124
          ) {
            await this.refreshGoogleToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 1 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            this.googleOauthClient.setCredentials({
              access_token: this.decryptToken(value.Token),
              refresh_token: this.decryptToken(value.RefreshToken),
            });
            await calendar.events.delete({
              auth: this.googleOauthClient,
              calendarId: 'primary',
              eventId: eventId,
              sendUpdates: 'all',
            });
          } else {
            if (error.message !== 'Resource has been deleted')
              // This if block used when the meeting is deleted from google but not from database
              throw new BadRequestError(
                'Error deleting google event: ' + error
              );
          }
        }
      }
      if (meetingOptionId === 2) {
        let value = await this.getTokensFromLocalCache(2, userId);
        try {
          await deleteZoomMeeting(
            this.zoom.API_BASE_URL,
            this.decryptToken(value.Token),
            eventId
          );
        } catch (error) {
          if (
            error.message.response.data.message === 'Invalid access token.' ||
            error.message.response.data.code === 124
          ) {
            await this.refreshZoomToken(
              userId,
              this.decryptToken(value.RefreshToken)
            );
            value = this.tokens.find(
              (row) =>
                row.ThirdPartyApiID === 2 &&
                row.UserID === parseInt(userId) &&
                row.IsDeleted === false
            );
            if (!value) throw new BadRequestError('Zoom not integrated');
            await deleteZoomMeeting(
              this.zoom.API_BASE_URL,
              this.decryptToken(value.Token),
              eventId
            );
          } else {
            throw new BadRequestError('Failed to delete Meeting: ' + error);
          }
        }
        try {
          sgMail.setApiKey(this.apiKey);
          const message = {
            to: emails,
            from: this.senderEmail,
            subject: 'Interview Canceled',
            html: getEmailBody(
              'deleteZoomMeeting',
              this.apiBaseUrl,
              this.clientBaseUrl,
              {
                meetingTitle: meetingName,
                meetingId,
              }
            ),
          };
          await this.sendEmail(message);
        } catch (error) {
          throw new BadRequestError('Error while sending email: ' + error);
        }
      }
      await this.models.meetings.update(
        {
          IsDeleted: true,
          ModifiedBy: userId,
          ModifiedDate: Date.now(),
        },
        {
          where: {
            ID: parseInt(meetingId),
          },
          transaction: t,
        }
      );
      await this.createNotification(6, keyMapList, 'Canceled Interview');
    });
    return { success: true };
  };
  populateMeetingDropDowns = async ({ companyId }) => {
    const durations = await this.models.durations.findAll({
      attributes: ['ID', 'TimeSpan'],
      where: {
        IsDeleted: false,
      },
    });
    const meetingTypes = await this.models.meetingTypes.findAll({
      attributes: ['ID', 'Name'],
      where: {
        IsDeleted: false,
      },
    });
    const timeZones = await this.models.timezones.findAll({
      attributes: ['ID', 'DisplayName', 'GoogleCalendarName'],
      where: {
        IsDeleted: false,
      },
    });
    const users = await this.models.users.findAll({
      attributes: ['ID', 'Name', 'EmailAddress'],
      where: {
        CompanyID: companyId,
        IsVerified: true,
        IsDeleted: false,
      },
    });
    const companyLocations = await this.models.companyLocations.findAll({
      attributes: ['ID', 'AddressLine1', 'AddressLine2'],
      include: [
        {
          required: false,
          model: this.models.countries,
        },
        {
          required: false,
          model: this.models.states,
        },
        {
          required: false,
          model: this.models.cities,
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const dropdownsData = {
      users,
      companyLocations,
      durations,
      meetingTypes,
      timeZones,
    };
    return { dropdownsData, success: true };
  };
  fetchTasksAndMeetings = async ({ userId, startDateTime, endDateTime }) => {
    const Meetings = await this.models.meetings.findAll({
      include: [
        {
          required: true,
          model: this.models.meetingTeamMembers,
          where: {
            UserID: userId,
            IsDeleted: false,
          },
        },
        {
          model: this.models.durations,
        },
      ],
      where: {
        MeetingDateTime: {
          [Op.between]: [startDateTime, endDateTime],
        },
        IsDeleted: false,
      },
    });
    const assignedToUserTasksSelfIncluded = await this.models.tasks.findAll({
      include: [
        {
          required: true,
          model: this.models.taskAssignees,
          include: [
            {
              attributes: ['ID', 'Name'],
              required: true,
              model: this.models.users,
            },
          ],
          where: {
            UserID: userId,
          },
        },
      ],
      where: {
        DueDate: {
          [Op.between]: [startDateTime, endDateTime],
        },
        IsDeleted: false,
      },
    });
    const userData = [...assignedToUserTasksSelfIncluded, ...Meetings];
    return {
      userData,
      success: true,
    };
  };
  fetchUserThirdPartyApis = async ({ userId }) => {
    const results = await this.models.thirdPartyAPIs.findAll({
      attributes: ['ID', 'Name', 'Description', 'Icon'],
      include: [
        {
          required: false,
          attributes: ['ThirdPartyApiID'],
          model: this.models.thirdPartyAPITokens,
          where: {
            UserID: userId,
            IsDeleted: false,
          },
        },
      ],
      where: {
        IsDeleted: false,
      },
    });
    return {
      results,
      success: true,
    };
  };
  removeThirdPartyApi = async ({ userId, thirdPartyApiId }) => {
    let value = await this.getTokensFromLocalCache(thirdPartyApiId, userId);
    if (thirdPartyApiId === 1) {
      await this.models.thirdPartyAPITokens.update(
        { IsDeleted: true },
        {
          where: {
            UserID: userId,
            ThirdPartyApiID: thirdPartyApiId,
            IsDeleted: false,
          },
        }
      );
      return {
        success: true,
      };
    }
    if (thirdPartyApiId === 2) {
      try {
        await revokeZoomToken(
          this.decryptToken(value.Token),
          this.zoom.Client_ID,
          this.zoom.Client_Secret,
          this.zoom.ZOOM_OAUTH_REVOKE_TOKEN_URL
        );
      } catch (error) {
        if (error.message === 'Error: Token Expired') {
          await this.refreshZoomToken(userId, value.RefreshToken);
          value = this.tokens.find(
            (row) =>
              row.ThirdPartyApiID === thirdPartyApiId &&
              row.UserID === parseInt(userId) &&
              row.IsDeleted === false
          );
          await revokeZoomToken(
            this.decryptToken(value.Token),
            this.zoom.Client_ID,
            this.zoom.Client_Secret,
            this.zoom.ZOOM_OAUTH_REVOKE_TOKEN_URL
          );
        } else {
          throw new BadRequestError('Failed to revoke zoom token ' + error);
        }
      }
    }
    await this.models.thirdPartyAPITokens.update(
      { IsDeleted: true },
      {
        where: {
          UserID: userId,
          ThirdPartyApiID: thirdPartyApiId,
          IsDeleted: false,
        },
      }
    );
    return {
      success: true,
    };
  };
  fetchDashboardData = async ({ companyId, userId, isAdmin }) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    let jobsData = [];
    let applicantCount;
    if (isAdmin) {
      jobsData = await this.models.jobs.findAll({
        include: [
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
              },
              {
                model: this.models.teams,
                attributes: ['ID', 'Name'],
                include: [
                  {
                    model: this.models.teamMembers,
                    attributes: ['ID'],
                    include: [
                      {
                        required: true,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: { IsDeleted: false },
                      },
                    ],
                    where: { IsDeleted: false },
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
          },
          {
            required: true,
            model: this.models.companyLocations,
            include: [
              {
                required: false,
                model: this.models.countries,
              },
              {
                required: false,
                model: this.models.cities,
              },
            ],
          },
          {
            required: false,
            model: this.models.jobTags,
            include: [
              {
                attributes: ['Name'],
                model: this.models.tags,
              },
            ],
          },
          {
            required: false,
            model: this.models.applications,
            where: {
              ApplicantStatusID: 2,
              IsDeleted: false,
            },
          },
        ],
        where: {
          CompanyID: companyId,
          IsActive: true,
          IsDeleted: false,
        },
        order: [['CreatedDate', 'DESC']],
      });
      applicantCount = await this.models.applicants.count({
        include: [
          {
            required: true,
            model: this.models.applications,
            where: {
              ApplicantStatusID: 1,
            },
          },
        ],
        where: {
          CreatedDate: {
            [Op.gte]: currentDate,
            [Op.lt]: endOfDay,
          },
          CompanyID: companyId,
          IsDeleted: false,
        },
      });
    } else {
      const individualUserInHiringTeam = await this.models.jobs.findAll({
        include: [
          {
            required: true,
            model: this.models.jobHiringTeam,
            where: { UserID: userId },
          },
        ],
        where: {
          CompanyID: companyId,
          IsActive: true,
          IsDeleted: false,
        },
      });
      const teamUserInHiringTeam = await this.models.jobs.findAll({
        include: [
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                required: true,
                model: this.models.teams,
                attributes: ['ID', 'Name'],
                include: [
                  {
                    required: true,
                    model: this.models.teamMembers,
                    attributes: ['ID'],
                    include: [
                      {
                        required: true,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: { ID: userId, IsDeleted: false },
                      },
                    ],
                    where: { IsDeleted: false },
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
            where: { UserID: userId },
          },
        ],
        where: {
          CompanyID: companyId,
          IsActive: true,
          IsDeleted: false,
        },
      });
      jobsData = [...teamUserInHiringTeam, ...individualUserInHiringTeam];
      const userInJobIds = [];
      jobsData.forEach((job) => {
        if (!userInJobIds.includes(job.ID)) {
          userInJobIds.push(job.ID);
        }
      });
      jobsData = await this.models.jobs.findAll({
        include: [
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
              },
              {
                model: this.models.teams,
                attributes: ['ID', 'Name'],
                include: [
                  {
                    model: this.models.teamMembers,
                    attributes: ['ID'],
                    include: [
                      {
                        required: true,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: { IsDeleted: false },
                      },
                    ],
                    where: { IsDeleted: false },
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
          },
          {
            required: true,
            model: this.models.companyLocations,
            include: [
              {
                required: false,
                model: this.models.countries,
              },
              {
                required: false,
                model: this.models.cities,
              },
            ],
          },
          {
            required: false,
            model: this.models.jobTags,
            include: [
              {
                attributes: ['Name'],
                model: this.models.tags,
              },
            ],
          },
          {
            required: false,
            model: this.models.applications,
            where: {
              ApplicantStatusID: 2,
              IsDeleted: false,
            },
          },
        ],
        where: {
          CompanyID: companyId,
          ID: userInJobIds,
          IsActive: true,
          IsDeleted: false,
        },
        order: [['CreatedDate', 'DESC']],
      });
      applicantCount = await this.models.applicants.count({
        include: [
          {
            required: true,
            model: this.models.applications,
            where: {
              JobID: userInJobIds,
              ApplicantStatusID: 1,
            },
          },
        ],
        where: {
          CreatedDate: {
            [Op.gte]: currentDate,
            [Op.lt]: endOfDay,
          },
          CompanyID: companyId,
          IsDeleted: false,
        },
      });
    }

    const meetings = await this.models.meetings.findAll({
      attributes: [
        'Title',
        'MeetingDateTime',
        'MeetingLink',
        'MeetingTypeID',
        'MeetingOptionID',
      ],
      include: [
        {
          required: false,
          model: this.models.meetingTypes,
        },
        {
          required: false,
          model: this.models.companyLocations,
          include: [
            {
              required: false,
              model: this.models.cities,
            },
            {
              required: false,
              model: this.models.countries,
            },
          ],
        },
        {
          required: true,
          model: this.models.meetingTeamMembers,
          where: {
            UserID: userId,
            IsDeleted: false,
          },
        },
        {
          model: this.models.applicants,
          attributes: ['ID', 'FullName'],
          where: { IsDeleted: false },
          required: false,
          include: [
            {
              model: this.models.applications,
              include: [
                {
                  model: this.models.jobs,
                },
              ],
            },
            {
              required: false,
              model: this.models.candidateDocuments,
              where: {
                DocumentTypeID: 4,
                IsDeleted: false,
              },
            },
          ],
        },
        {
          model: this.models.durations,
        },
      ],
      where: {
        MeetingDateTime: {
          [Op.gte]: currentDate,
          [Op.lt]: endOfDay,
        },
        IsDeleted: false,
      },
    });

    let TasksData = await this.models.tasks.findAll({
      include: [
        {
          required: true,
          model: this.models.taskAssignees,
          include: [
            {
              required: true,
              model: this.models.users,
              attributes: ['ID', 'Name'],
              where: {
                IsDeleted: false,
              },
            },
          ],
          where: {
            UserID: userId,
          },
        },
      ],
      where: {
        TaskStatusID: {
          [Op.ne]: 2,
        },
        DueDate: {
          [Op.gte]: currentDate,
          [Op.lt]: endOfDay,
        },
        IsDeleted: false,
      },
      order: [['CreatedDate', 'DESC']],
    });
    const userInTaskIds = [];
    TasksData.forEach((task) => {
      if (!userInTaskIds.includes(task.ID)) {
        userInTaskIds.push(task.ID);
      }
    });
    TasksData = await this.models.tasks.findAll({
      include: [
        {
          required: true,
          model: this.models.taskAssignees,
          include: [
            {
              required: true,
              model: this.models.users,
              attributes: ['ID', 'Name'],
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
      ],
      where: {
        ID: userInTaskIds,
        TaskStatusID: {
          [Op.ne]: 2,
        },
        DueDate: {
          [Op.gte]: currentDate,
          [Op.lt]: endOfDay,
        },
        IsDeleted: false,
      },
      order: [['CreatedDate', 'DESC']],
    });
    return {
      applicantCount,
      jobsData,
      meetings,
      TasksData,
      success: true,
    };
  };
  fetchDashboardMeetings = async ({ userId, date }) => {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await this.models.meetings.findAll({
      attributes: [
        'Title',
        'MeetingDateTime',
        'MeetingLink',
        'MeetingTypeID',
        'MeetingOptionID',
      ],
      include: [
        {
          required: false,
          model: this.models.meetingTypes,
        },
        {
          required: false,
          model: this.models.companyLocations,
          include: [
            {
              required: false,
              model: this.models.cities,
            },
            {
              required: false,
              model: this.models.countries,
            },
          ],
        },
        {
          required: true,
          model: this.models.meetingTeamMembers,
          where: {
            UserID: userId,
            IsDeleted: false,
          },
        },
        {
          model: this.models.applicants,
          attributes: ['ID', 'FullName'],
          where: { IsDeleted: false },
          required: false,
          include: [
            {
              model: this.models.applications,
              include: [
                {
                  model: this.models.jobs,
                },
              ],
            },
            {
              required: false,
              model: this.models.candidateDocuments,
              where: {
                DocumentTypeID: 4,
                IsDeleted: false,
              },
            },
          ],
        },
        {
          model: this.models.durations,
        },
      ],
      where: {
        MeetingDateTime: {
          [Op.gte]: currentDate,
          [Op.lt]: endOfDay,
        },
        IsDeleted: false,
      },
    });
    return {
      meetings,
      success: true,
    };
  };

  updateUserAlerts = async ({ alertId }) => {
    await this.models.userNotifications.update(
      { IsRead: true },
      {
        where: {
          ID: alertId,
        },
      }
    );
    return {
      success: true,
    };
  };
  fetchUserAlerts = async ({ userId }) => {
    const userAlerts = await this.models.userNotifications.findAll({
      include: [
        {
          attributes: ['ID', 'Title'],
          model: this.models.notificationCategories,
        },
      ],
      where: {
        UserID: userId,
        IsDeleted: false,
      },
      limit: 15,
      order: [['CreatedDate', 'DESC']],
    });
    return {
      userAlerts,
      success: true,
    };
  };

  fetchUserNotificationsData = async ({ userId }) => {
    let isAdmin = false;
    let hasSlackIntegration = false;
    const hasSlack = await this.models.thirdPartyAPITokens.findOne({
      where: {
        UserID: userId,
        ThirdPartyApiID: 3,
        IsDeleted: false,
      },
    });
    const adminUser = await this.models.users.findOne({
      include: [
        {
          required: true,
          attributes: ['ID', 'Name'],
          model: this.models.roles,
          where: {
            Name: 'Administrator',
          },
        },
      ],
      where: {
        ID: userId,
      },
    });
    if (adminUser) {
      isAdmin = true;
    }
    if (hasSlack) {
      hasSlackIntegration = true;
    }
    const NotificationsData = await this.models.notificationCategories.findAll({
      attributes: ['ID', 'Title'],
      include: [
        {
          attributes: ['ID', 'Name'],
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
              where: {
                UserID: userId,
              },
            },
          ],
        },
      ],
      where: {
        IsSystem: false,
      },
    });
    return {
      isAdmin,
      hasSlackIntegration,
      NotificationsData,
      success: true,
    };
  };
  updateUserNotifications = async ({ userId, selectedNotifications }) => {
    const userNotificationSettings =
      await this.models.userNotificationSettings.findAll({
        where: {
          UserID: userId,
        },
      });
    if (!userNotificationSettings || userNotificationSettings.length < 1) {
      // on first ever try we will create these settings for userNotificationSettings object
      const sequelizeBulkData = [];
      for (const notificationToAdd of selectedNotifications) {
        sequelizeBulkData.push({
          UserID: userId,
          NotificationID: notificationToAdd.NotificationID,
          SendEmailNotification: notificationToAdd.SendEmailNotification,
          SendAlertNotification: notificationToAdd.SendAlertNotification,
          SendSlackNotification: notificationToAdd.SendSlackNotification,
        });
      }
      await this.models.userNotificationSettings.bulkCreate(sequelizeBulkData);
      return {
        success: true,
      };
    }
    const currentSelectedNotifications = [];
    userNotificationSettings.forEach((notificationSetting) => {
      currentSelectedNotifications.push({
        NotificationID: notificationSetting.NotificationID,
        SendEmailNotification: notificationSetting.SendEmailNotification,
        SendAlertNotification: notificationSetting.SendAlertNotification,
        SendSlackNotification: notificationSetting.SendSlackNotification,
      });
    });

    await this.sequelize.transaction(async (t) => {
      const notificationsToDelete = currentSelectedNotifications.filter(
        (dbUserNotifications) =>
          !selectedNotifications.some(
            (userNotification) =>
              userNotification.NotificationID ===
                dbUserNotifications.NotificationID &&
              userNotification.SendEmailNotification ===
                dbUserNotifications.SendEmailNotification &&
              userNotification.SendAlertNotification ===
                dbUserNotifications.SendAlertNotification &&
              userNotification.SendSlackNotification ===
                dbUserNotifications.SendSlackNotification
          )
      );
      const notificationsToAdd = selectedNotifications.filter(
        (selectedNotification) =>
          !currentSelectedNotifications.some(
            (dbUserNotifications) =>
              selectedNotification.NotificationID ===
                dbUserNotifications.NotificationID &&
              selectedNotification.SendEmailNotification ===
                dbUserNotifications.SendEmailNotification &&
              selectedNotification.SendAlertNotification ===
                dbUserNotifications.SendAlertNotification &&
              selectedNotification.SendSlackNotification ===
                dbUserNotifications.SendSlackNotification
          )
      );
      for (const notificationToDelete of notificationsToDelete) {
        await this.models.userNotificationSettings.destroy({
          where: {
            UserID: userId,
            NotificationID: notificationToDelete.NotificationID,
            SendEmailNotification: notificationToDelete.SendEmailNotification,
            SendAlertNotification: notificationToDelete.SendAlertNotification,
            SendSlackNotification: notificationToDelete.SendSlackNotification,
          },
          transaction: t,
        });
      }
      const sequelizeBulkData = [];
      for (const notificationToAdd of notificationsToAdd) {
        sequelizeBulkData.push({
          UserID: userId,
          NotificationID: notificationToAdd.NotificationID,
          SendEmailNotification: notificationToAdd.SendEmailNotification,
          SendAlertNotification: notificationToAdd.SendAlertNotification,
          SendSlackNotification: notificationToAdd.SendSlackNotification,
        });
      }
      await this.models.userNotificationSettings.bulkCreate(sequelizeBulkData, {
        transaction: t,
      });
    });
    return {
      success: true,
    };
  };
  taskDueScheduledNotifications = async () => {
    await this.createScheduledTaskPendingNotification();
    return {
      success: true,
    };
  };
}

module.exports = UsersService;

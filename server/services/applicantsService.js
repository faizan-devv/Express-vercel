const { BadRequestError } = require('../utils/errorTypes');
const { verifyEmail } = require('./utils/verifyHelpers');
const { DOCUMENTS_PATH } = require('../../server/constants/multerConstants');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { formatDate } = require('./utils/datetimeHelpers');
const { getEmailBody } = require('./utils/emailTemplateSelector');
const {
  parseResume,
  getRelevancyScore,
} = require('./thirdPartyApis/googlePalmApi');
const BaseService = require('./baseService');

class ApplicantsService extends BaseService {
  constructor(
    models,
    sequelize,
    apiKey,
    senderEmail,
    apiBaseUrl,
    offerUrl,
    clientBaseUrl,
    slack
  ) {
    super(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack);
    this.senderEmail = senderEmail;
    this.offerUrl = offerUrl;
  }

  generateHash = async () => {
    const token = await crypto.randomBytes(32).toString('hex');
    let hash = crypto.createHash('sha256').update(token).digest('base64');
    hash = hash.split('/').join(''); // we need to remove forward slashes as they can interfer in routing of application
    return hash;
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

  editParsedApplicant = async (requestBody) => {
    const {
      CompanyID,
      ApplicantID,
      UserID,
      CandidateEducation,
      CandidateWorkingExperience,
      CandidateTags,
      Email,
    } = requestBody;
    const applicant = await this.models.applicants.findOne({
      where: {
        ID: { [Op.ne]: ApplicantID },
        Email: Email,
        CompanyID: CompanyID,
        IsVerified: true,
        IsDeleted: false,
      },
    });
    if (applicant) {
      throw new BadRequestError('Applicant already exists !');
    }
    const updateApplicantObject = Object.fromEntries(
      Object.entries(requestBody).filter(
        ([key]) =>
          key !== 'CandidateWorkingExperience' &&
          key !== 'CandidateEducation' &&
          key !== 'CandidateTags' &&
          key !== 'UserID' &&
          key !== 'CompanyID' &&
          key !== 'ApplicantID'
      )
    );
    updateApplicantObject['ModifiedBy'] = UserID;
    updateApplicantObject['ModifiedDate'] = Date.now();
    await this.sequelize.transaction(async (t) => {
      await this.models.applicants.update(updateApplicantObject, {
        where: { ID: ApplicantID },
        transaction: t,
      });
      const createdPropertiesObject = {
        ApplicantID: ApplicantID,
        CreatedAt: Date.now(),
        CreatedBy: UserID,
      };
      if (CandidateTags && CandidateTags.length > 0) {
        await this.models.candidateTags.destroy(
          {
            where: {
              ApplicantID: ApplicantID,
            },
          },
          {
            transaction: t,
          }
        );
        const sequelizeCandidateTagsBulkData = [];
        const sequelizeNewTagsBulkData = [];

        for await (const tag of CandidateTags) {
          const tagExists = await this.models.tags.findOne({
            where: {
              Name: tag,
              CompanyID: parseInt(companyId),
            },
          });
          if (!tagExists) {
            sequelizeNewTagsBulkData.push({
              Name: tag,
              CompanyID: CompanyID,
              CreatedBy: UserID,
            });
          } else {
            sequelizeCandidateTagsBulkData.push({
              ApplicantID: ApplicantID,
              TagID: tagExists.ID,
            });
          }
        }
        const newTagsList = await this.models.tags.bulkCreate(
          sequelizeNewTagsBulkData,
          {
            transaction: t,
          }
        );

        newTagsList.forEach((newTagData) => {
          sequelizeCandidateTagsBulkData.push({
            ApplicantID: ApplicantID,
            TagID: newTagData.ID,
          });
        });
        await this.models.candidateTags.bulkCreate(
          sequelizeCandidateTagsBulkData,
          {
            transaction: t,
          }
        );
      }
      const dbCandidateWorkingExperience =
        await this.models.candidateWorkingExperience.findAll({
          where: {
            ApplicantID: ApplicantID,
          },
        });
      const dbCandidateEducation = await this.models.candidateEducation.findAll(
        {
          where: {
            ApplicantID: ApplicantID,
          },
        }
      );
      const workExperienceToDelete = dbCandidateWorkingExperience.filter(
        (dbcwe) => {
          if (dbcwe.ID) {
            return !CandidateWorkingExperience.some(
              (newcwe) => newcwe.ID === dbcwe.ID
            );
          } else {
            return false;
          }
        }
      );
      const educationToDelete = dbCandidateEducation.filter((dbce) => {
        if (dbce.ID) {
          return !CandidateEducation.some((newce) => newce.ID === dbce.ID);
        } else {
          return false;
        }
      });
      for (const we of workExperienceToDelete) {
        await this.models.candidateWorkingExperience.destroy({
          where: {
            ID: we.ID,
          },
          transaction: t,
        });
      }
      for (const ed of educationToDelete) {
        await this.models.candidateEducation.destroy({
          where: {
            ID: ed.ID,
          },
          transaction: t,
        });
      }
      if (CandidateWorkingExperience && CandidateWorkingExperience.length > 0) {
        for (const cwe of CandidateWorkingExperience) {
          if (!cwe.ID) {
            await this.models.candidateWorkingExperience.create(
              {
                ...createdPropertiesObject,
                ...cwe,
              },
              {
                transaction: t,
              }
            );
          } else {
            const updateCweObject = Object.fromEntries(
              Object.entries(cwe).filter(([key]) => key !== 'ID')
            );
            await this.models.candidateWorkingExperience.update(
              {
                ...updateCweObject,
                ModifiedDate: Date.now(),
                ModifiedBy: UserID,
              },
              {
                where: {
                  ID: parseInt(cwe.ID),
                },
                transaction: t,
              }
            );
          }
        }
      }
      if (CandidateEducation && CandidateEducation.length > 0) {
        for (const ce of CandidateEducation) {
          if (!ce.ID) {
            await this.models.candidateEducation.create(
              {
                ...createdPropertiesObject,
                ...ce,
              },
              {
                transaction: t,
              }
            );
          } else {
            const updateCeObject = Object.fromEntries(
              Object.entries(ce).filter(([key]) => key !== 'ID')
            );
            await this.models.candidateEducation.update(
              {
                ...updateCeObject,
                ModifiedDate: Date.now(),
                ModifiedBy: UserID,
              },
              {
                where: {
                  ID: parseInt(ce.ID),
                },
                transaction: t,
              }
            );
          }
        }
      }
    });
    return {
      success: true,
    };
  };

  fetchParsedApplicant = async ({ applicantId }) => {
    const applicantData = await this.models.applicants.findOne({
      include: [
        {
          required: false,
          model: this.models.candidateEducation,
          where: {
            IsDeleted: false,
          },
          order: [['ID', 'DESC']],
        },
        {
          required: false,
          model: this.models.candidateWorkingExperience,
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
            {
              required: false,
              model: this.models.employmentTypes,
            },
          ],
          where: {
            IsDeleted: false,
          },
          order: [['ID', 'DESC']],
        },
        {
          required: false,
          model: this.models.candidateTags,
          include: [
            {
              required: false,
              model: this.models.tags,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          required: false,
          model: this.models.companies,
        },
        {
          required: false,
          model: this.models.genders,
        },
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
        {
          required: false,
          model: this.models.candidateDocuments,

          where: {
            DocumentTypeID: [1, 4],
            IsDeleted: false,
          },
        },
        {
          required: false,
          model: await this.models.applications,
          include: [
            {
              attributes: ['ID', 'Title', 'JobStatusID'],
              required: false,
              model: await this.models.jobs,
              where: {
                JobStatusID: [1, 2, 4],
              },
            },
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.stages,
            },
          ],
          where: {
            IsDeleted: false,
          },
          order: [['ID', 'DESC']],
        },
        {
          required: false,
          model: await this.models.candidatePools,
          include: [
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.pools,
            },
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.stages,
            },
          ],
          where: { IsDeleted: false },
        },
        {
          attributes: ['ID', 'Name'],
          required: false,
          model: this.models.users,
        },
      ],
      where: {
        ID: applicantId,
        IsDeleted: false,
      },
    });

    const jobs = await this.models.applications.findAll({
      attributes: [
        'ID',
        'ApplicantID',
        'JobID',
        'StageID',
        'ExpectedSalary',
        'Score',
        'RelevancyScore',
        'CreatedDate',
        [this.sequelize.literal("'Positions'"), 'type'],
      ],
      include: [
        {
          attributes: ['ID', 'FullName'],
          required: true,
          model: this.models.applicants,
          where: {
            Email: applicantData.Email,
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Title'],
          required: true,
          model: await this.models.jobs,
          include: [
            {
              required: false,
              model: await this.models.jobStatuses,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: false,
          model: await this.models.stages,
          IsDeleted: false,
        },
      ],
      where: {
        IsDeleted: false,
        ApplicantStatusID: 2,
      },
      order: [['id', 'DESC']],
    });

    const pools = await this.models.candidatePools.findAll({
      attributes: [
        'ID',
        'ApplicantID',
        'PoolID',
        'CreatedDate',
        [this.sequelize.literal("'Pools'"), 'type'],
      ],
      include: [
        {
          attributes: ['ID', 'FullName'],
          required: true,
          model: this.models.applicants,
          where: {
            Email: applicantData.Email,
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: await this.models.pools,
          where: {
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: false,
          model: await this.models.stages,
          IsDeleted: false,
        },
      ],
      where: {
        IsDeleted: false,
      },
      order: [['id', 'DESC']],
    });

    const combinedArray = jobs.concat(pools);
    const sortedArray = combinedArray.sort(
      (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
    );
    return {
      jobsAndPools: sortedArray,
      applicantData: applicantData,
      success: true,
    };
  };

  fetchAllApplicants = async ({
    offset,
    limit,
    companyId,
    filters,
    jobId,
    poolId,
  }) => {
    let searchStringWhereClause = {};
    if (filters.searchString) {
      const FullName = {
        [Op.like]: `%${filters.searchString}%`,
      };
      const Email = {
        [Op.like]: `%${filters.searchString}%`,
      };
      const PhoneNumber = {
        [Op.like]: `%${filters.searchString}%`,
      };
      searchStringWhereClause = {
        [Op.or]: [{ FullName }, { Email }, { PhoneNumber }],
      };
    }
    if (jobId) {
      const results = await this.models.applicants.findAndCountAll({
        distinct: true,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            required: false,
            model: this.models.candidateDocuments,
            where: {
              DocumentTypeID: 4,
              IsDeleted: false,
            },
          },
          {
            model: this.models.candidatePools,
            required: false,
            where: {
              PoolID: poolId,
              IsDeleted: false,
            },
          },
          {
            model: this.models.applications,
            include: [
              {
                attributes: ['ID', 'Title', 'JobStatusID'],
                required: false,
                model: await this.models.jobs,
                where: {
                  JobStatusID: [1, 2, 4],
                },
              },
              {
                attributes: ['ID', 'Name'],
                required: false,
                model: await this.models.stages,
              },
            ],
            where: {
              JobID: jobId,
              ApplicantStatusID: 2,
              IsDeleted: false,
            },
          },
          {
            attributes: ['ID', 'Name'],
            required: false,
            model: this.models.users,
          },
        ],
        where: {
          ...searchStringWhereClause,
          CompanyID: companyId,
          IsDeleted: false,
        },
        order: [['ID', 'DESC']],
      });
      return {
        results,
        success: true,
      };
    }
    if (poolId) {
      const results = await this.models.applicants.findAndCountAll({
        distinct: true,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            required: false,
            model: this.models.candidateDocuments,
            where: {
              DocumentTypeID: 4,
              IsDeleted: false,
            },
          },
          {
            model: this.models.applications,
            required: false,
            where: {
              JobID: jobId,
              ApplicantStatusID: 2,
              IsDeleted: false,
            },
          },
          {
            model: this.models.candidatePools,
            include: [
              {
                attributes: ['ID', 'Name'],
                required: false,
                model: await this.models.pools,
              },
              {
                attributes: ['ID', 'Name'],
                required: false,
                model: await this.models.stages,
              },
            ],
            where: {
              PoolID: poolId,
              IsDeleted: false,
            },
          },
          {
            attributes: ['ID', 'Name'],
            required: false,
            model: this.models.users,
          },
        ],
        where: {
          ...searchStringWhereClause,
          CompanyID: companyId,
          IsDeleted: false,
        },
        order: [['ID', 'DESC']],
      });
      return {
        results,
        success: true,
      };
    }
    const results = await this.models.applicants.findAndCountAll({
      distinct: true,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          required: false,
          model: this.models.candidateDocuments,
          where: {
            DocumentTypeID: 4,
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'StageID', 'Score', 'RelevancyScore'],
          required: false,
          model: await this.models.applications,
          include: [
            {
              attributes: ['ID', 'Title', 'JobStatusID'],
              required: false,
              model: await this.models.jobs,
              where: {
                JobStatusID: [1, 2, 4],
              },
            },
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.stages,
            },
          ],
          where: {
            IsDeleted: false,
            ApplicantStatusID: 2,
          },
        },
        {
          required: false,
          model: await this.models.candidatePools,
          include: [
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.pools,
            },
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: await this.models.stages,
            },
          ],
          where: { IsDeleted: false },
        },
        {
          attributes: ['ID', 'Name'],
          required: false,
          model: this.models.users,
        },
      ],
      where: {
        ...searchStringWhereClause,
        CompanyID: companyId,
        IsDeleted: false,
      },
      order: [['ID', 'DESC']],
    });
    return {
      results,
      success: true,
    };
  };

  systemCandidateActivityMessage = async (creationBody, messageIndex, t) => {
    const formattedDate = formatDate(new Date(creationBody.CreatedDate));
    const MessageMap = {
      1: `<span>[ApplicantID] was created by [CreatedBy] at ${formattedDate}`,
      2: `<span>[ApplicantID] was created on Position <b style="color: black;">[JobToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}`,
      3: `<span>[ApplicantID] was created on Pool <b style="color: black;">[PoolToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}`,

      4: `<span>[ApplicantID] was moved from Pool <b style="color: black;">[PoolFromID]</b> to Pool <b style="color: black;">[PoolToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,
      5: `<span>[ApplicantID] was moved from Pool <b style="color: black;">[PoolFromID]</b> to Position <b style="color: black;">[JobToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,
      6: `<span>[ApplicantID] was moved from Position <b style="color: black;">[JobFromID]</b> to Pool <b style="color: black;">[PoolToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,
      7: `<span>[ApplicantID] was moved from Position <b style="color: black;">[JobFromID]</b> to Position <b style="color: black;">[JobToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,

      8: `<span>[CreatedBy] updated Candidate [ApplicantID] Stage <b style="color: black;">[StageFromID] -> [StageToID]</b> on Position <b style="color: black;">[JobToID]</b> at ${formattedDate}</span>`,
      9: `<span>[CreatedBy] updated Candidate [ApplicantID] Stage <b style="color: black;">[StageFromID] -> [StageToID]</b> on Pool <b style="color: black;">[PoolToID]</b> at ${formattedDate}</span>`,

      10: `<span>[ApplicantID] was added to Pool <b style="color: black;">[PoolToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,
      11: `<span>[ApplicantID] was added to Position <b style="color: black;">[JobToID]</b> at stage <b style="color: black;">[StageToID]</b> by [CreatedBy] at ${formattedDate}</span>`,

      12: `<span>Offer has been sent to the Candidate [ApplicantID] for the Position <b style="color: black;">[JobToID]</b> at ${formattedDate}</span>`,
      13: `<span>Candidate [ApplicantID] has [OfferStatusID] the Offer for the Position at ${formattedDate}</span>`,

      14: `<span>[ApplicantID] applied through public page on Position <b style="color: black;">[JobToID]</b> at ${formattedDate}</span>`,
      15: `<span>[ApplicantID] was approved by [CreatedBy] at ${formattedDate}</span>`,
      16: `<span>[ApplicantID] was rejected by [CreatedBy] at ${formattedDate}</span>`,
    };
    creationBody.Message = MessageMap[messageIndex];
    await this.models.candidateActivities.create(creationBody, {
      transaction: t,
    });
  };

  updateOfferStatus = async ({ applicantId, offerStatusId, hash, comment }) => {
    const candidateOffer = await this.models.candidateOffers.findOne({
      where: { OfferHash: hash, IsDeleted: 0, IsCompleted: false },
    });
    if (!candidateOffer) {
      throw new BadRequestError(
        'Hash invalid or a response has been recorded for this offer already or it no longer exists'
      );
    }
    const updateOfferObject = {
      OfferStatusID: offerStatusId,
      ModifiedDate: Date.now(),
      OfferComment: comment,
      IsCompleted: true,
    };
    await this.sequelize.transaction(async (t) => {
      await this.models.candidateOffers.update(updateOfferObject, {
        where: { ID: candidateOffer.ID },
        transaction: t,
      });
      await this.systemCandidateActivityMessage(
        {
          ApplicantID: applicantId,
          OfferStatusID: offerStatusId,
          CreatedDate: Date.now(),
        },
        13,
        t
      );
    });
    return {
      success: true,
    };
  };

  createOffer = async (
    {
      userId,
      applicantId,
      subject,
      description,
      offerExpirationDate,
      senderEmail,
      jobId,
    },
    offer
  ) => {
    if (!offer) {
      throw new BadRequestError('no offer document found to upload');
    }
    const path = this.apiBaseUrl + '/api/applicants/' + offer.filename;
    const applicantData = await this.models.applicants.findOne({
      attributes: ['Email'],
      where: {
        ID: applicantId,
      },
    });
    const hash = await this.generateHash();
    await this.sequelize.transaction(async (t) => {
      const document = await this.models.candidateDocuments.create(
        {
          Path: path,
          Name: offer.originalname,
          DocumentTypeID: 2,
          ApplicantID: parseInt(applicantId),
          CreatedBy: parseInt(userId),
          CreatedDate: Date.now(),
        },
        {
          transaction: t,
        }
      );
      const currrentoffer = await this.models.candidateOffers.create(
        {
          ApplicantID: parseInt(applicantId),
          OfferStatusID: 1,
          CandidateDocumentID: parseInt(document.ID),
          OfferHash: hash,
          Subject: subject,
          Description: description,
          OfferExpirationDate: offerExpirationDate,
          CreatedBy: parseInt(userId),
          CreatedDate: Date.now(),
        },
        {
          transaction: t,
        }
      );
      await this.systemCandidateActivityMessage(
        {
          ApplicantID: applicantId,
          JobToID: jobId,
          CreatedDate: Date.now(),
        },
        12,
        t
      );
      // Read the PDF file and convert it to a base64 string
      const offerContent = fs.readFileSync(offer.path).toString('base64');
      const message = {
        to: applicantData.Email,
        from: senderEmail,
        subject: subject,
        attachments: [
          {
            content: offerContent,
            filename: offer.filename,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
        html: getEmailBody('offer', this.apiBaseUrl, this.clientBaseUrl, {
          offerDescription: description,
          offerUrl: this.offerUrl,
          hash,
        }),
      };

      await this.sendEmail(message);
    });
    return {
      success: true,
    };
  };

  fetchOffer = async ({ offerHash }) => {
    const offerData = await this.models.candidateOffers.findAll({
      include: [
        {
          model: this.models.offerStatuses,
        },
        {
          attributes: ['Name', 'Path'],
          model: this.models.candidateDocuments,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        OfferHash: offerHash,
      },
    });
    return {
      offerData,
      success: true,
    };
  };

  fetchOfferStatuses = async () => {
    const offerStatuses = await this.models.offerStatuses.findAll();
    return {
      offerStatuses,
      success: true,
    };
  };

  fetchAllOffers = async ({ applicantId }) => {
    const offers = await this.models.applicants.findOne({
      attributes: ['ID', 'FullName'],
      include: [
        {
          model: this.models.candidateOffers,
          include: [
            {
              model: this.models.offerStatuses,
            },
            {
              attributes: ['Name', 'Path'],
              model: this.models.candidateDocuments,
              where: {
                IsDeleted: false,
              },
            },
          ],
        },
      ],
      where: {
        ID: applicantId,
        IsDeleted: false,
      },
    });
    return {
      offers,
      success: true,
    };
  };

  manageApplicant = async ({ applicantId, applicantStatusId, userId, jobId }) => {
    let applicationUpdateObject = {
      ApplicantStatusID: applicantStatusId,
    };
    const currentTime = Date.now();
    const applicantStatusData = await this.models.applicantStatuses.findOne({
      where: {
        ID: applicantStatusId,
      },
    });
    const updatingUser = await this.models.users.findOne({
      attributes: ['Name'],
      where: {
        ID: userId,
      },
    });
    const updatedApplicant = await this.models.applicants.findOne({
      attributes: ['FullName'],
      where: {
        ID: applicantId,
      },
    });
    const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(jobId);
    const jobData = await this.models.jobs.findOne({
      attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
      where: {
        ID: jobId,
      },
    });
    const jobPostingUser = await this.models.users.findOne({
      attributes: ['ID', 'Name', 'EmailAddress'],
      where: {
        ID: jobData.CreatedBy,
      },
    });
    const keyMapList = [];
    for (const member of hiringTeamMembersData) {
      keyMapList.push({
        UserID: member.UserID,
        Email: member.Email,
        ApplicantName: updatedApplicant.FullName,
        PositionName: jobData.Title,
        UserName: updatingUser.Name,
        ApplicantStatus: applicantStatusData.Name,
      });
    }
    if (
      !hiringTeamMembersData.some(
        (member) => jobPostingUser.ID === member.UserID
      )
    ) {
      keyMapList.push({
        UserID: jobPostingUser.ID,
        Email: jobPostingUser.EmailAddress,
        ApplicantName: updatedApplicant.FullName,
        PositionName: jobData.Title,
        UserName: updatingUser.Name,
        ApplicantStatus: applicantStatusData.Name,
      });
    }
    await this.sequelize.transaction(async (t) => {
      if (applicantStatusId === 3) {
        applicationUpdateObject = {
          IsDeleted: true,
          ...applicationUpdateObject,
        };
        await this.models.applications.update(applicationUpdateObject, {
          where: {
            ApplicantID: applicantId,
          },
          transaction: t,
        });
        await this.models.applicants.update(
          {
            IsDeleted: true,
          },
          {
            where: {
              ID: applicantId,
            },
            transaction: t,
          }
        );
        await this.systemCandidateActivityMessage(
          {
            ApplicantID: applicantId,
            CreatedBy: userId,
            CreatedDate: currentTime,
          },
          16,
          t
        );
      } else {
        await this.models.applications.update(applicationUpdateObject, {
          where: {
            ApplicantID: applicantId,
          },
          transaction: t,
        });
        await this.systemCandidateActivityMessage(
          {
            ApplicantID: applicantId,
            CreatedBy: userId,
            CreatedDate: currentTime,
          },
          15,
          t
        );
      }
      await this.createNotification(
        5,
        keyMapList,
        'Applicant Status Updated',
        this.notificationRedirectsLinks.Position + jobId
      );
    });
    return {
      success: true,
    };
  };

  fetchPublicApplicants = async ({ companyId, jobId }) => {
    let jobWhereClause = {};
    if (jobId) {
      jobWhereClause = {
        ID: jobId,
      };
    }
    const jobs = await this.models.jobs.findAll({
      include: [
        {
          required: true,
          model: this.models.applications,
          include: [
            {
              required: true,
              model: this.models.applicants,
              include: [
                {
                  model: this.models.candidateWorkingExperience,
                  order: [['StartDate', 'DESC']],
                  required: false,
                },
                {
                  model: this.models.candidateDocuments,
                  required: false,
                  where: {
                    DocumentTypeID: 4,
                    IsDeleted: false,
                  },
                },
              ],
              where: {
                IsDeleted: false,
              },
            },
          ],

          where: {
            ApplicantStatusID: 1,
          },
        },
      ],
      order: [[this.models.applications, 'ID', 'DESC']],
      where: {
        ...jobWhereClause,
        CompanyId: companyId,
        IsDeleted: false,
      },
    });
    return {
      jobs,
      success: true,
    };
  };

  createPublicApplicant = async (
    {
      companyId,
      email,
      fullName,
      phoneNumber,
      age,
      description,
      jobId,
      expectedSalary,
      linkedInURL,
      tags,
      candidateWorkingExperience,
      candidateEducation,
      coverLetter,
    },
    document
  ) => {
    if (!companyId) {
      throw new BadRequestError('Company Id must be provided');
    }
    if (!jobId) {
      throw new BadRequestError('Job Id must be provided');
    }

    companyId = parseInt(companyId);
    jobId = parseInt(jobId);
    let resumeFilePath = null;
    let profilePicture = null;

    if (document.document) {
      resumeFilePath = '/applicants/' + document.document[0]?.filename;
    }
    if (document.profilePicture) {
      profilePicture = '/applicants/' + document.profilePicture[0].filename;
    }

    if (!verifyEmail(email)) {
      if (document.document) {
        if (resumeFilePath)
          fs.unlinkSync(path.resolve(document.document[0]?.path));
      }
      if (document.profilePicture) {
        if (profilePicture)
          fs.unlinkSync(path.resolve(document.profilePicture[0].path));
      }
      throw new BadRequestError('Entered Email is not Valid !');
    }
    const applicant = await this.models.applicants.findOne({
      include: [
        {
          required: true,
          model: this.models.applications,
          where: {
            JobID: jobId,
            IsDeleted: false,
          },
        },
      ],
      where: {
        Email: email,
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    if (applicant) {
      throw new BadRequestError('Applicant already exists !');
    }
    const jobData = await this.models.jobs.findOne({
      include: [
        {
          model: this.models.pipelines,
          include: [
            {
              model: this.models.stages,
            },
          ],
        },
      ],
      where: {
        ID: jobId,
      },
    });
    const currentTime = Date.now();
    await this.sequelize.transaction(async (t) => {
      const currentApplicant = await this.models.applicants.create(
        {
          CompanyID: companyId,
          FullName: fullName,
          Email: email,
          PhoneNumber: phoneNumber,
          Description: description,
          Age: age,
          LinkedInProfile: linkedInURL,
          ExpectedSalary: expectedSalary,
          CreatedAt: currentTime,
          IsVerified: false,
        },
        { transaction: t }
      );
      if (resumeFilePath) {
        await this.models.candidateDocuments.create(
          {
            Path: resumeFilePath,
            Name: document.document[0]?.originalname,
            DocumentTypeID: 1,
            ApplicantID: parseInt(currentApplicant.ID),
            CreatedDate: currentTime,
          },
          { transaction: t }
        );
      }
      if (profilePicture) {
        await this.models.candidateDocuments.create(
          {
            Path: profilePicture,
            Name: document.profilePicture[0]?.originalname,
            DocumentTypeID: 4,
            ApplicantID: parseInt(currentApplicant.ID),
            CreatedDate: currentTime,
          },
          { transaction: t }
        );
      }
      await this.models.applications.create(
        {
          JobID: jobId,
          ApplicantID: parseInt(currentApplicant.ID),
          StageID: parseInt(jobData?.Pipeline?.Stages[1].ID),
          CreatedAt: currentTime,
          ApplicantStatusID: 1,
          CoverLetter: coverLetter,
        },
        { transaction: t }
      );
      await this.systemCandidateActivityMessage(
        {
          ApplicantID: parseInt(currentApplicant.ID),
          JobToID: jobId,
          CreatedDate: currentTime,
        },
        14,
        t
      );
      if (tags) {
        const sequelizeCandidateTagsBulkData = [];
        const sequelizeNewTagsBulkData = [];

        for await (const tag of tags) {
          const tagExists = await this.models.tags.findOne({
            where: {
              Name: tag,
              CompanyID: parseInt(companyId),
            },
          });
          if (!tagExists) {
            sequelizeNewTagsBulkData.push({
              Name: tag,
              CompanyID: companyId,
            });
          } else {
            sequelizeCandidateTagsBulkData.push({
              ApplicantID: parseInt(currentApplicant.ID),
              TagID: tagExists.ID,
            });
          }
        }
        const newTagsList = await this.models.tags.bulkCreate(
          sequelizeNewTagsBulkData,
          {
            transaction: t,
          }
        );

        newTagsList.forEach((newTagData) => {
          sequelizeCandidateTagsBulkData.push({
            ApplicantID: parseInt(currentApplicant.ID),
            TagID: parseInt(newTagData.ID),
          });
        });
        await this.models.candidateTags.bulkCreate(
          sequelizeCandidateTagsBulkData,
          {
            transaction: t,
          }
        );
      }
      const createdPropertiesObject = {
        ApplicantID: parseInt(currentApplicant.ID),
        CreatedAt: currentTime,
      };
      if (candidateWorkingExperience) {
        const seqeulizeCandidateWorkExperinceBulkData = [];
        for (const cwe of candidateWorkingExperience) {
          seqeulizeCandidateWorkExperinceBulkData.push({
            ...createdPropertiesObject,
            ...cwe,
            EndDate: cwe.EndDate?.length ? cwe.EndDate : null,
          });
        }
        await this.models.candidateWorkingExperience.bulkCreate(
          seqeulizeCandidateWorkExperinceBulkData,
          {
            transaction: t,
          }
        );
      }
      if (candidateEducation) {
        const seqeulizeCandidateEducationBulkData = [];
        for (const ce of candidateEducation) {
          seqeulizeCandidateEducationBulkData.push({
            ...createdPropertiesObject,
            ...ce,
            CGPA: ce.CGPA === 'undefined' ? null : ce.CGPA,
            EndDate: ce.EndDate?.length ? ce.EndDate : null,
          });
        }
        await this.models.candidateEducation.bulkCreate(
          seqeulizeCandidateEducationBulkData,
          {
            transaction: t,
          }
        );
      }
      try {
        sgMail.setApiKey(this.apiKey);
        const message = {
          to: email,
          from: this.senderEmail,
          subject: 'Applied for Open Position',
          html: getEmailBody(
            'application',
            this.apiBaseUrl,
            this.clientBaseUrl,
            {
              positionName: jobData.Title,
              applicantName: currentApplicant.FullName,
            }
          ),
        };
        await this.sendEmail(message);
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
      const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(jobId);
      const job = await this.models.jobs.findOne({
        attributes: ['ID', 'CreatedBy'],
        where: {
          ID: jobId,
        },
      });
      const jobPostingUser = await this.models.users.findOne({
        attributes: ['ID', 'Name', 'EmailAddress'],
        where: {
          ID: job.CreatedBy,
        },
      });
      const keyMapList = [];
      for (const member of hiringTeamMembersData) {
        keyMapList.push({
          UserID: member.UserID,
          Email: member.Email,
          ApplicantName: fullName,
          PositionName: jobData.Title,
        });
      }
      if (
        !hiringTeamMembersData.some(
          (member) => jobPostingUser.ID === member.UserID
        )
      ) {
        keyMapList.push({
          UserID: jobPostingUser.ID,
          Email: jobPostingUser.EmailAddress,
          ApplicantName: fullName,
          PositionName: jobData.Title,
        });
      }
      await this.createNotification(5, keyMapList, 'Candidate Apply');
    });
    return {
      success: true,
    };
  };

  editApplicantPersonalInfo = async ({
    Id,
    fullName,
    email,
    phoneNumber,
    genderId,
    dob,
    expectedSalary,
    linkedUrl,
    cityId,
    stateId,
    countryId,
    userId,
  }) => {
    const updateObject = {
      ModifiedBy: userId,
      ModifiedDate: Date.now(),
      FullName: fullName,
      Email: email,
      PhoneNumber: phoneNumber,
      GenderID: genderId,
      DateOfBirth: dob,
      LinkedInProfile: linkedUrl,
      ExpectedSalary: expectedSalary,
      CityID: cityId,
      StateID: stateId,
      CountryID: countryId,
    };
    await this.models.applicants.update(updateObject, {
      where: {
        ID: Id,
      },
    });

    return {
      success: true,
    };
  };
  addEditCandidateExperience = async ({
    id,
    applicantID,
    designation,
    employmentTypeID,
    companyName,
    countryID,
    stateID,
    cityID,
    description,
    startDate,
    isCurrentRole,
    endDate,
    userId,
  }) => {
    await this.sequelize.transaction(async (t) => {
      const cwe = {
        ApplicantID: applicantID,
        Designation: designation,
        EmploymentTypeID: employmentTypeID,
        CompanyName: companyName,
        CountryID: countryID,
        StateID: stateID,
        CityID: cityID,
        Description: description,
        StartDate: startDate,
        IsCurrentRole: isCurrentRole,
        EndDate: endDate,
      };
      if (id === 0) {
        await this.models.candidateWorkingExperience.create(
          { ...cwe, CreatedBy: userId, CreatedDate: Date.now() },
          { transaction: t }
        );
      } else {
        await this.models.candidateWorkingExperience.update(
          { ...cwe, ModifiedBy: userId, ModifiedDate: Date.now() },
          {
            where: {
              ID: id,
            },
            transaction: t,
          }
        );
      }
    });
    return {
      success: true,
    };
  };
  addEditCandidateEducation = async ({
    id,
    applicantID,
    schoolName,
    degreeName,
    description,
    startDate,
    endDate,
    cGPA,
    userId,
  }) => {
    await this.sequelize.transaction(async (t) => {
      const cwe = {
        ApplicantID: applicantID,
        SchoolName: schoolName,
        DegreeName: degreeName,
        Description: description,
        StartDate: startDate,
        EndDate: endDate,
        CGPA: cGPA,
      };
      if (id === 0) {
        await this.models.candidateEducation.create(
          { ...cwe, CreatedBy: userId, CreatedDate: Date.now() },
          { transaction: t }
        );
      } else {
        await this.models.candidateEducation.update(
          { ...cwe, ModifiedBy: userId, ModifiedDate: Date.now() },
          {
            where: {
              ID: id,
            },
            transaction: t,
          }
        );
      }
    });
    return {
      success: true,
    };
  };

  createApplicant = async (
    {
      companyId,
      email,
      fullName,
      phoneNumber,
      age,
      linkedInURL,
      description,
      genderId,
      location,
      dateOfBirth,
      userId,
      entityId,
      stageId,
      expectedSalary,
      isPosition,
      tags,
      candidateWorkingExperience,
      candidateEducation,
    },
    document
  ) => {
    if (!companyId) {
      throw new BadRequestError('company Id must be provided');
    }
    if (!userId) {
      throw new BadRequestError('userId must be provided');
    }
    companyId = parseInt(companyId);
    userId = parseInt(userId);
    entityId = entityId === undefined ? null : parseInt(entityId);
    stageId = stageId === undefined ? null : parseInt(stageId);
    let resumeFilePath = '';
    if (document) {
      resumeFilePath = '/applicants/' + document.filename;
    }
    if (!verifyEmail(email)) {
      if (resumeFilePath) fs.unlinkSync(path.resolve(document.path));
      throw new BadRequestError('Entered Email is not Valid !');
    }

    const addingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    const currentTime = Date.now();
    await this.sequelize.transaction(async (t) => {
      const currentApplicant = await this.models.applicants.create(
        {
          CompanyID: companyId,
          FullName: fullName,
          Email: email,
          PhoneNumber: phoneNumber,
          Description: description,
          Age: age,
          DateOfBirth: dateOfBirth,
          GenderID: genderId,
          LinkedInProfile: linkedInURL,
          Location: location,
          CreatedBy: userId,
          ExpectedSalary: expectedSalary,
          CreatedAt: currentTime,
          IsVerified: true,
        },
        { transaction: t }
      );
      if (document) {
        await this.models.candidateDocuments.create(
          {
            Path: resumeFilePath,
            Name: document.originalname,
            DocumentTypeID: 1,
            ApplicantID: parseInt(currentApplicant.ID),
            CreatedBy: userId,
            CreatedDate: Date.now(),
          },
          { transaction: t }
        );
      }

      const positionKeyMapList = [];
      const poolKeyMapList = [];
      if (entityId) {
        if (!isPosition) {
          throw new BadRequestError(
            'Not specified if candidate needs to be added in pool or position'
          );
        }
        if (isPosition === 'true' || isPosition === 'True') {
          const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(
            entityId
          );
          const jobDescription = await this.models.jobs.findOne({
            attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
            where: {
              ID: entityId,
            },
          });
          const jobPostingUser = await this.models.users.findOne({
            attributes: ['ID', 'Name', 'EmailAddress'],
            where: {
              ID: jobDescription.CreatedBy,
            },
          });
          for (const member of hiringTeamMembersData) {
            positionKeyMapList.push({
              UserID: member.UserID,
              Email: member.Email,
              ApplicantName: fullName,
              PositionName: jobDescription.Title,
              UserName: addingUser.Name,
            });
          }
          if (
            !hiringTeamMembersData.some(
              (member) => jobPostingUser.ID === member.UserID
            )
          ) {
            positionKeyMapList.push({
              UserID: jobPostingUser.ID,
              Email: jobPostingUser.EmailAddress,
              ApplicantName: fullName,
              PositionName: jobDescription.Title,
              UserName: addingUser.Name,
            });
          }
          let parsedInformation = null;
          if (document) {
            try {
              parsedInformation = await getRelevancyScore(
                resumeFilePath,
                jobDescription.Description
              );
            } catch (error) {}
          }
          await this.models.applications.create(
            {
              JobID: entityId,
              ApplicantStatusID: 2,
              ApplicantID: parseInt(currentApplicant.ID),
              StageID: stageId,
              IsQualified: true,
              CreatedBy: userId,
              CreatedAt: currentTime,
              RelevancyScore: parsedInformation?.relevancyPercentage || null,
            },
            { transaction: t }
          );
          await this.systemCandidateActivityMessage(
            {
              ApplicantID: parseInt(currentApplicant.ID),
              JobToID: entityId,
              StageToID: stageId,
              CreatedBy: userId,
              CreatedDate: currentTime,
            },
            2,
            t
          );
        } else {
          const poolData = await this.models.pools.findOne({
            attributes: ['Name', 'CreatedBy'],
            where: {
              ID: entityId,
            },
          });
          const poolCreatorUser = await this.models.users.findOne({
            attributes: ['Name', 'ID', 'EmailAddress'],
            where: {
              ID: poolData.CreatedBy,
            },
          });
          poolKeyMapList.push({
            UserID: poolCreatorUser.ID,
            Email: poolCreatorUser.EmailAddress,
            ApplicantName: fullName,
            PoolName: poolData.Name,
            UserName: addingUser.Name,
          });
          await this.models.candidatePools.create(
            {
              PoolID: entityId,
              ApplicantID: parseInt(currentApplicant.ID),
              StageID: stageId,
              CreatedBy: userId,
              CreatedAt: currentTime,
            },
            { transaction: t }
          );
          await this.systemCandidateActivityMessage(
            {
              ApplicantID: parseInt(currentApplicant.ID),
              PoolToID: entityId,
              StageToID: stageId,
              CreatedBy: userId,
              CreatedDate: currentTime,
            },
            3,
            t
          );
        }
      } else {
        await this.systemCandidateActivityMessage(
          {
            ApplicantID: parseInt(currentApplicant.ID),
            CreatedBy: userId,
            CreatedDate: currentTime,
          },
          1,
          t
        );
      }
      if (tags) {
        const sequelizeCandidateTagsBulkData = [];
        const sequelizeNewTagsBulkData = [];

        for await (const tag of tags) {
          const tagExists = await this.models.tags.findOne({
            where: {
              Name: tag,
              CompanyID: parseInt(companyId),
            },
          });
          if (!tagExists) {
            sequelizeNewTagsBulkData.push({
              Name: tag,
              CreatedBy: userId,
              CompanyID: companyId,
            });
          } else {
            sequelizeCandidateTagsBulkData.push({
              ApplicantID: parseInt(currentApplicant.ID),
              TagID: tagExists.ID,
            });
          }
        }
        const newTagsList = await this.models.tags.bulkCreate(
          sequelizeNewTagsBulkData,
          {
            transaction: t,
          }
        );

        newTagsList.forEach((newTagData) => {
          sequelizeCandidateTagsBulkData.push({
            ApplicantID: parseInt(currentApplicant.ID),
            TagID: parseInt(newTagData.ID),
          });
        });
        await this.models.candidateTags.bulkCreate(
          sequelizeCandidateTagsBulkData,
          {
            transaction: t,
          }
        );
      }
      const createdPropertiesObject = {
        ApplicantID: parseInt(currentApplicant.ID),
        CreatedAt: currentTime,
        CreatedBy: userId,
      };
      if (candidateWorkingExperience) {
        const seqeulizeCandidateWorkExperinceBulkData = [];
        for (const cwe of candidateWorkingExperience) {
          seqeulizeCandidateWorkExperinceBulkData.push({
            ...createdPropertiesObject,
            ...cwe,
            IsCurrentRole: parseInt(cwe.IsCurrentRole) ? 1 : 0,
            EndDate: cwe.EndDate?.length ? cwe.EndDate : null,
          });
        }
        await this.models.candidateWorkingExperience.bulkCreate(
          seqeulizeCandidateWorkExperinceBulkData,
          {
            transaction: t,
          }
        );
      }
      if (candidateEducation) {
        const seqeulizeCandidateEducationBulkData = [];
        for (const ce of candidateEducation) {
          seqeulizeCandidateEducationBulkData.push({
            ...createdPropertiesObject,
            ...ce,
            CGPA: ce.CGPA === 'undefined' ? null : ce.CGPA,
            EndDate: ce.EndDate?.length ? ce.EndDate : null,
          });
        }
        await this.models.candidateEducation.bulkCreate(
          seqeulizeCandidateEducationBulkData,
          {
            transaction: t,
          }
        );
      }
      if (isPosition === 'true' || isPosition === 'True') {
        await this.createNotification(
          5,
          positionKeyMapList,
          'Candidate Added Position',
          this.notificationRedirectsLinks.Position + entityId
        );
      } else {
        await this.createNotification(
          5,
          poolKeyMapList,
          'Candidate Added Pool',
          this.notificationRedirectsLinks.Pool + entityId
        );
      }
    });
    return {
      success: true,
    };
  };
  addEditCandidatePicture = async ({ applicantId, userId }, document) => {
    let pictureFilePath = '';
    let pictureName = '';
    if (document) {
      pictureFilePath = '/applicants/' + document.filename;
      pictureName = document.originalname;
    }
    const profilePicture = await this.models.candidateDocuments.findOne({
      where: {
        ApplicantID: applicantId,
        DocumentTypeID: 4,
        IsDeleted: false,
      },
    });
    if (profilePicture) {
      const cwe = {
        Path: pictureFilePath,
        Name: pictureName,
        ModifiedBy: userId,
        ModifiedDate: Date.now(),
        IsDeleted: document ? 0 : 1,
      };
      await this.models.candidateDocuments.update(
        {
          ...cwe,
        },
        {
          where: {
            ApplicantID: applicantId,
            DocumentTypeID: 4,
            IsDeleted: false,
          },
        }
      );
    } else {
      await this.models.candidateDocuments.create({
        Path: pictureFilePath,
        Name: document.originalname,
        DocumentTypeID: 4,
        ApplicantID: parseInt(applicantId),
        CreatedBy: userId,
        CreatedDate: Date.now(),
      });
    }

    return {
      success: true,
    };
  };

  addCandidateResume = async ({ applicantId, userId }, document) => {
    let resumeFilePath = '';
    if (document) {
      resumeFilePath = '/applicants/' + document.filename;
    }
    const currentTime = Date.now();
    const resume = await this.models.candidateDocuments.findOne({
      where: {
        ApplicantID: applicantId,
        IsDeleted: false,
      },
    });
    if (resume) {
      await this.models.candidateDocuments.update(
        {
          Path: resumeFilePath,
          Name: document.originalname,
          ModifiedBy: userId,
          ModifiedDate: Date.now(),
        },
        {
          where: {
            ApplicantID: applicantId,
            DocumentTypeID: 1,
            IsDeleted: false,
          },
        }
      );
    } else {
      await this.models.candidateDocuments.create({
        Path: resumeFilePath,
        Name: document.originalname,
        DocumentTypeID: 1,
        ApplicantID: parseInt(applicantId),
        CreatedBy: userId,
        CreatedDate: Date.now(),
      });
    }

    return {
      success: true,
    };
  };

  commentApplicantDiscussion = async ({ discussion, mentionUsers }) => {
    await this.sequelize.transaction(async (t) => {
      let currentDiscussion;
      if (discussion.ID === 0) {
       currentDiscussion = await this.models.candidateDiscussions.create(
          {
            ...discussion,
            CreatedDate: Date.now(),
            CreatedBy: discussion.UserId,
          },
          { transaction: t }
        );
      } else {
        await this.models.candidateDiscussions.update(
          {
            ...discussion,
            ModifiedDate: Date.now(),
          },
          {
            where: {
              ID: discussion.ID,
            },
            transaction: t,
          }
        );
      }
      const sequelizeMentionedUsersBulkData = [];

      for await (const user of mentionUsers) {
        let alreadyExistingUser =
          await this.models.discussionMentionedUsers.findOne({
            where: {
              CandidateDiscussionsID:
                discussion.ID === 0 ? currentDiscussion.ID : discussion.ID,
              UserID: user.id,
            },
          });
        if (alreadyExistingUser) {
          await this.models.discussionMentionedUsers.update(
            { 
              ModifiedBy: discussion.UserId,
              ModifiedDate: Date.now(),
              IsDeleted: false,
            },
            {
              where: {
                CandidateDiscussionsID:
                discussion.ID === 0 ? currentDiscussion.ID : discussion.ID,
              UserID: user.id,
              },
              transaction: t,
            });
        } else {
          await this.models.discussionMentionedUsers.create(
            {
              UserID: user.id,
              CandidateDiscussionsID: parseInt(
                discussion.ID === 0 ? currentDiscussion.ID : discussion.ID
              ),
              CreatedBy: discussion.UserId,
              CreatedDate: Date.now(),
              IsDeleted: false,
            },
            {
              transaction: t,
            }
          );
        } 
      }
  
      await this.models.discussionMentionedUsers.update(
        {
          IsDeleted: true,
          ModifiedBy: discussion.UserId,
          ModifiedDate: Date.now(),
        },
        {
          where: {
            UserID: { [Op.notIn]: mentionUsers.map((item) => item.id) },
            CandidateDiscussionsID:
              discussion.ID === 0 ? currentDiscussion.ID : discussion.ID,
          },
          transaction: t,
        }
      );
    });
    return {
      success: true,
    };
  };

  fetchApplicantDiscussion = async ({ applicantId }) => {
    const discussionData = await this.models.candidateDiscussions.findAll({
      include: [
        {
          attributes: ['ID', 'Name','PictureURL'],
          model: await this.models.users,
          where: {IsDeleted:false}
        },
        {
          required:false,
          attributes: ['UserID'],
          model: await this.models.discussionMentionedUsers, 
          include: [
            {
              attributes: ['ID', 'Name' ],
              model: await this.models.users,
              where: {IsDeleted:false}
            }
          ],
          where: {IsDeleted:false} 
        },
        {
          required:false,
          attributes: ['Message'],
          model: await this.models.candidateDiscussions,
          where: {IsDeleted:false},
          as: 'ReplyDiscussion',
        }
        
      ],
      where: {
        ApplicantID: applicantId,
        IsDeleted:false
      },
      order: [['CreatedDate', 'ASC']],
    });
    const activityData = await this.models.candidateActivities.findAll({
      include: [
        {
          attributes: ['ID', 'Name'],
          model: await this.models.stages,
          as: 'StageFrom',
        },
        {
          attributes: ['ID', 'Name'],
          model: await this.models.stages,
          as: 'StageTo',
        },
        {
          attributes: ['ID', 'Title'],
          model: await this.models.jobs,
          as: 'JobTo',
        },
        {
          attributes: ['ID', 'Title'],
          model: await this.models.jobs,
          as: 'JobFrom',
        },
        {
          attributes: ['ID', 'Name'],
          model: await this.models.pools,
          as: 'PoolFrom',
        },
        {
          attributes: ['ID', 'Name'],
          model: await this.models.pools,
          as: 'PoolTo',
        },
        {
          attributes: ['ID', 'FullName'],
          model: await this.models.applicants,
        },
        {
          attributes: ['ID', 'Name','PictureURL'],
          model: await this.models.users,
        },
        {
          attributes: ['ID', 'Name'],
          model: await this.models.offerStatuses,
        },
      ],
      where: {
        ApplicantID: applicantId,
      },
      order: [['CreatedDate', 'ASC']],
    });
    let replacements = {
      CreatedBy: null,
      ApplicantID: null,
      StageFromID: null,
      StageToID: null,
      JobToID: null,
      JobFromID: null,
      PoolToID: null,
      PoolFromID: null,
      JobStatusID: null,
    };
    for (const activity of activityData) {
      replacements.CreatedBy = activity?.User?.Name;
      replacements.ApplicantID = activity?.Applicant?.FullName;
      replacements.StageFromID = activity?.StageFrom?.Name;
      replacements.StageToID = activity?.StageTo?.Name;
      replacements.JobToID = activity?.JobTo?.Title;
      replacements.JobFromID = activity?.JobFrom?.Title;
      replacements.PoolToID = activity?.PoolTo?.Name;
      replacements.PoolFromID = activity?.PoolFrom?.Name;
      replacements.JobStatusID = activity?.OfferStatus?.Title;

      activity.Message = this.replacePlaceholdersActivity(
        activity.Message,
        replacements
      );
    }
    let discussion = [...discussionData, ...activityData];
    discussion = discussion.sort(
      (a, b) => new Date(a.CreatedDate) - new Date(b.CreatedDate)
    );
    return {
      discussion,
      success: true,
    };
  };

  replacePlaceholdersActivity = (message, replacements) => {
    const regex = /\[([^\]]+)]/g;
    const replacedMessage = message.replace(regex, (match, key) => {
      if (replacements.hasOwnProperty(key)) {
        return replacements[key];
      }
      return match;
    });
    return replacedMessage;
  };

  deleteApplicantNote = async ({ id, userId }) => {
    await this.models.candidateNotes.update(
      {
        IsDeleted: true,
        ModifiedBy: userId,
        ModifiedDate: Date.now(),
      },
      {
        where: {
          ID: id,
        },
      }
    );
    return {
      success: true,
    };
  };

  setApplicantNote = async ({ id, userId, applicantId, description }) => {
    if (id === 0) {
      await this.models.candidateNotes.create({
        ApplicantID: applicantId,
        UserID: userId,
        Description: description,
        CreatedBy: userId,
        CreatedDate: Date.now(),
      });
      return {
        success: true,
      };
    } else {
      await this.models.candidateNotes.update(
        {
          Description: description,
          ModifiedBy: userId,
          ModifiedDate: Date.now(),
        },
        {
          where: {
            ID: id,
          },
        }
      );
    }
    return {
      success: true,
    };
  };
  fetchNotes = async ({ userId, applicantId }) => {
    const noteData = await this.models.candidateNotes.findAll({
      where: {
        ApplicantID: applicantId,
        UserID: userId,
        IsDeleted: false,
      },
      order: [['ID', 'DESC']],
    });
    return {
      noteData,
      success: true,
    };
  };
  fetchAllDocuments = async ({ applicantId }) => {
    const documentsData = await this.models.candidateDocuments.findAll({
      include: [
        {
          attributes: ['Name'],
          model: await this.models.users,
        },
      ],
      where: {
        ApplicantID: applicantId,
        IsDeleted: false,
      },
    });
    return {
      documentsData,
      success: true,
    };
  };
  uploadDocument = async (body, document) => {
    if (!document) {
      throw new BadRequestError('no document found to upload');
    }
    const path = this.apiBaseUrl + '/api/applicants/' + document.filename;
    await this.models.candidateDocuments.create({
      Path: path,
      Name: document.originalname,
      DocumentTypeID: 3,
      ApplicantID: body.applicantId,
      CreatedBy: body.userId,
      CreatedDate: Date.now(),
    });
    return {
      success: true,
    };
  };

  updateResume = async (body, document) => {
    if (!document) {
      throw new BadRequestError('no resume file found');
    }
    body.Path = this.apiBaseUrl + '/api/applicants/' + document.filename;
    body.Name = document.originalname;
    body.ModifiedDate = Date.now();
    await this.models.candidateDocuments.update(body, {
      where: { ApplicantID: parseInt(body.ID), DocumentTypeID: 1 },
    });
    return {
      success: true,
    };
  };

  updateCandidateTags = async ({ tags, applicantId, companyId, userId }) => {
    await this.sequelize.transaction(async (t) => {
      await this.models.candidateTags.destroy(
        {
          where: {
            ApplicantID: applicantId,
          },
        },
        {
          transaction: t,
        }
      );
      const sequelizeCandidateTagsBulkData = [];
      const sequelizeNewTagsBulkData = [];

      for await (const tag of tags) {
        const tagExists = await this.models.tags.findOne({
          where: {
            Name: tag,
            CompanyID: parseInt(companyId),
          },
        });
        if (!tagExists) {
          sequelizeNewTagsBulkData.push({
            Name: tag,
            CompanyID: companyId,
            CreatedBy: userId,
          });
        } else {
          sequelizeCandidateTagsBulkData.push({
            ApplicantID: applicantId,
            TagID: tagExists.ID,
          });
        }
      }
      const newTagsList = await this.models.tags.bulkCreate(
        sequelizeNewTagsBulkData,
        {
          transaction: t,
        }
      );

      newTagsList.forEach((newTagData) => {
        sequelizeCandidateTagsBulkData.push({
          ApplicantID: applicantId,
          TagID: parseInt(newTagData.ID),
        });
      });
      await this.models.candidateTags.bulkCreate(
        sequelizeCandidateTagsBulkData,
        {
          transaction: t,
        }
      );
    });
    return {
      success: true,
    };
  };
  fetchApplicantPositionPoolIds = async ({ applicantId }) => {
    const applicationsData = await this.models.applications.findAll({
      include: [
        {
          model: this.models.jobs,
          where: {
            jobStatusID: [1, 2, 4],
            IsDeleted: false,
          },
        },
      ],
      where: {
        ApplicantID: applicantId,
      },
    });
    return {
      success: true,
    };
  };

  moveApplicantsStages = async ({
    userId,
    applicationId,
    applicantId,
    entityId,
    fromStageId,
    toStageId,
    isPosition,
  }) => {
    const currentDate = Date.now();
    const positionKeyMapList = [];
    const poolKeyMapList = [];
    const applicant = await this.models.applicants.findOne({
      attibutes: ['FullName'],
      where: {
        ID: applicantId,
      },
    });
    const toStageData = await this.models.stages.findOne({
      where: {
        ID: toStageId,
      },
    });
    const fromStageData = await this.models.stages.findOne({
      where: {
        ID: fromStageId,
      },
    });
    const movingUser = await this.models.users.findOne({
      attributes: ['Name'],
      where: {
        ID: userId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      if (isPosition) {
        const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(
          entityId
        );
        const job = await this.models.jobs.findOne({
          attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
          where: {
            ID: entityId,
          },
        });
        const jobPostingUser = await this.models.users.findOne({
          attributes: ['ID', 'Name', 'EmailAddress'],
          where: {
            ID: job.CreatedBy,
          },
        });
        for (const member of hiringTeamMembersData) {
          positionKeyMapList.push({
            UserID: member.UserID,
            Email: member.Email,
            ApplicantName: applicant.FullName,
            StageFromName: fromStageData.Name,
            StageToName: toStageData.Name,
            UserName: movingUser.Name,
          });
        }
        if (
          !hiringTeamMembersData.some(
            (member) => jobPostingUser.ID === member.UserID
          )
        ) {
          positionKeyMapList.push({
            UserID: jobPostingUser.ID,
            Email: jobPostingUser.EmailAddress,
            ApplicantName: applicant.FullName,
            StageFromName: fromStageData.Name,
            StageToName: toStageData.Name,
            UserName: movingUser.Name,
          });
        }
        const updateObject = {
          StageID: toStageId,
          ModifiedBy: userId,
          ModifiedDate: currentDate,
        };
        await this.models.applications.update(updateObject, {
          where: {
            ID: applicationId,
            ApplicantStatusID: 2,
          },
          transaction: t,
        });

        await this.systemCandidateActivityMessage(
          {
            ApplicantID: applicantId,
            JobToID: entityId,
            StageFromID: fromStageId,
            StageToID: toStageId,
            CreatedBy: userId,
            CreatedDate: currentDate,
          },
          8,
          t
        );
      } else {
        const pool = await this.models.pools.findOne({
          where: {
            ID: entityId,
          },
        });
        const poolCreatorUser = await this.models.users.findOne({
          attributes: ['Name', 'ID', 'EmailAddress'],
          where: {
            ID: pool.CreatedBy,
          },
        });
        const updateObject = {
          StageID: toStageId,
          ModifiedBy: userId,
          ModifiedDate: currentDate,
        };
        poolKeyMapList.push({
          UserID: poolCreatorUser.ID,
          Email: poolCreatorUser.EmailAddress,
          ApplicantName: applicant.FullName,
          StageFromName: fromStageData.Name,
          StageToName: toStageData.Name,
          UserName: movingUser.Name,
        });
        await this.models.candidatePools.update(updateObject, {
          where: {
            ID: applicationId,
          },
          transaction: t,
        });
        await this.systemCandidateActivityMessage(
          {
            ApplicantID: applicantId,
            PoolToID: entityId,
            StageFromID: fromStageId,
            StageToID: toStageId,
            CreatedBy: userId,
            CreatedDate: currentDate,
          },
          9,
          t
        );
      }
      if (isPosition) {
        await this.createNotification(
          5,
          positionKeyMapList,
          'Candidate Stage Changed',
          this.notificationRedirectsLinks.Position + entityId
        );
      } else {
        await this.createNotification(
          5,
          poolKeyMapList,
          'Candidate Stage Changed',
          this.notificationRedirectsLinks.Pool + entityId
        );
      }
    });
    return {
      success: true,
    };
  };

  moveApplicants = async ({
    userId,
    applicantIdList,
    currentEntityId,
    destinationEntityId,
    stageId,
    isPositionCurrent,
    isPositionDestination,
  }) => {
    // The following Candidate/Candidates were moved to {EntityToName} on Stage {StageName} by User {UserName}: {MovedList}');
    let destinationEntity;
    let poolCreatorUser;
    const movedApplicantsIds = [];
    const keyMapList = [];
    const MovedList = [];
    if (isPositionDestination) {
      destinationEntity = await this.models.jobs.findOne({
        attributes: ['ID', 'Title'],
        where: {
          ID: destinationEntityId,
        },
      });
    } else {
      destinationEntity = await this.models.pools.findOne({
        attributes: ['ID', 'Name', 'CreatedBy'],
        where: {
          ID: destinationEntityId,
        },
      });
      poolCreatorUser = await this.models.users.findOne({
        attributes: ['Name', 'ID', 'EmailAddress'],
        where: {
          ID: destinationEntity.CreatedBy,
        },
      });
    }
    const movingUser = await this.models.users.findOne({
      attributes: ['Name'],
      where: {
        ID: userId,
      },
    });
    const movedToStage = await this.models.stages.findOne({
      where: {
        ID: stageId,
      },
    });
    for (const applicant of applicantIdList) {
      movedApplicantsIds.push(applicant.CandidateId);
    }
    const movedApplicantsData = await this.models.applicants.findAll({
      attributes: ['FullName'],
      where: {
        ID: movedApplicantsIds,
      },
    });
    for (const applicant of movedApplicantsData) {
      MovedList.push(applicant.FullName);
    }
    await this.sequelize.transaction(async (t) => {
      const currentTime = Date.now();
      if (isPositionDestination) {
        const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(
          destinationEntityId
        );
        const job = await this.models.jobs.findOne({
          attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
          where: {
            ID: destinationEntityId,
          },
        });
        const jobPostingUser = await this.models.users.findOne({
          attributes: ['ID', 'Name', 'EmailAddress'],
          where: {
            ID: job.CreatedBy,
          },
        });
        for (const member of hiringTeamMembersData) {
          keyMapList.push({
            UserID: member.UserID,
            Email: member.Email,
            EntityToName: 'Position ' + destinationEntity.Title,
            StageName: movedToStage.Name,
            MovedList,
            UserName: movingUser.Name,
          });
        }
        if (
          !hiringTeamMembersData.some(
            (member) => jobPostingUser.ID === member.UserID
          )
        ) {
          keyMapList.push({
            UserID: jobPostingUser.ID,
            Email: jobPostingUser.EmailAddress,
            EntityToName: 'Position ' + destinationEntity.Title,
            StageName: movedToStage.Name,
            MovedList,
            UserName: movingUser.Name,
          });
        }
      } else {
        keyMapList.push({
          UserID: poolCreatorUser.ID,
          Email: poolCreatorUser.EmailAddress,
          EntityToName: 'Pool ' + destinationEntity.Name,
          StageName: movedToStage.Name,
          MovedList,
          UserName: movingUser.Name,
        });
      }
      for (const applicant of applicantIdList) {
        if (isPositionDestination) {
          // if move to position
          if (applicant.positionId) {
            //if candidate already at position
            const applicationExists = await this.models.applications.findOne({
              where: {
                JobID: applicant.positionId,
                ApplicantID: applicant.CandidateId,
                IsDeleted: false,
              },
            });
            const result = await this.calculateApplicantRelevancyScore({
              applicantId: parseInt(applicant.CandidateId),
              jobId: parseInt(destinationEntityId),
            });
            const updateObject = {
              ModifiedBy: userId,
              ModifiedDate: currentTime,
              JobID: destinationEntityId,
              StageID: stageId,
              RelevancyScore: result?.parsedInformation.relevancyPercentage,
            };
            await this.models.applications.update(updateObject, {
              where: {
                ApplicantID: parseInt(applicant.CandidateId),
                JobID: applicant.positionId,
                IsDeleted: false,
              },
              transaction: t,
            });

            await this.systemCandidateActivityMessage(
              {
                ApplicantID: parseInt(applicant.CandidateId),
                JobToID: destinationEntityId,
                JobFromID: applicant.positionId,
                StageToID: stageId,
                CreatedBy: userId,
                CreatedDate: currentTime,
              },
              7,
              t
            );
          } else {
            //if candidate move from pool to position
            //delete from pool
            const updateObject = {
              ModifiedBy: userId,
              ModifiedDate: currentTime,
              IsDeleted: true,
            };
            await this.models.candidatePools.update(updateObject, {
              where: {
                ApplicantID: applicant.CandidateId,
                PoolID: applicant.poolId,
              },
              transaction: t,
            });

            const result = await this.calculateApplicantRelevancyScore({
              applicantId: parseInt(applicant.CandidateId),
              jobId: parseInt(destinationEntityId),
            });
            await this.models.applications.create(
              {
                JobID: destinationEntityId,
                ApplicantID: parseInt(applicant.CandidateId),
                ApplicantStatusID: 2,
                StageID: stageId,
                IsQualified: true,
                CreatedBy: userId,
                CreatedAt: currentTime,
                RelevancyScore: result?.parsedInformation.relevancyPercentage,
              },
              { transaction: t }
            );
            await this.systemCandidateActivityMessage(
              {
                ApplicantID: parseInt(applicant.CandidateId),
                JobToID: destinationEntityId,
                PoolFromID: applicant.poolId,
                StageToID: stageId,
                CreatedBy: userId,
                CreatedDate: currentTime,
              },
              5,
              t
            );
          }
        } else {
          //if move to pool
          if (applicant.positionId) {
            // from position to pool
            const updateObject = {
              ModifiedBy: userId,
              ModifiedDate: currentTime,
              IsDeleted: true,
            };
            await this.models.applications.update(updateObject, {
              where: {
                ApplicantID: parseInt(applicant.CandidateId),
                JobID: applicant.positionId,
                IsDeleted: false,
              },
              transaction: t,
            });

            await this.models.candidatePools.create(
              {
                PoolID: destinationEntityId,
                ApplicantID: parseInt(applicant.CandidateId),
                StageID: stageId,
                CreatedBy: userId,
                CreatedAt: currentTime,
              },
              { transaction: t }
            );
            await this.systemCandidateActivityMessage(
              {
                ApplicantID: parseInt(applicant.CandidateId),
                PoolToID: destinationEntityId,
                PoolFromID: applicant.poolId,
                StageToID: stageId,
                CreatedBy: userId,
                CreatedDate: currentTime,
              },
              6,
              t
            );
          } else {
            // from pool to pool
            const updateObject = {
              ModifiedBy: userId,
              ModifiedDate: currentTime,
              IsDeleted: true,
            };
            await this.models.candidatePools.update(updateObject, {
              where: {
                ApplicantID: parseInt(applicant.CandidateId),
                PoolID: applicant.poolId,
              },
              transaction: t,
            });
            await this.models.candidatePools.create(
              {
                PoolID: destinationEntityId,
                ApplicantID: parseInt(applicant.CandidateId),
                StageID: stageId,
                CreatedBy: userId,
                CreatedAt: currentTime,
              },
              { transaction: t }
            );
            await this.systemCandidateActivityMessage(
              {
                ApplicantID: parseInt(applicant.CandidateId),
                PoolToID: destinationEntityId,
                PoolFromID: applicant.poolId,
                StageToID: stageId,
                CreatedBy: userId,
                CreatedDate: currentTime,
              },
              4,
              t
            );
          }
        }
      }
      if (isPositionDestination) {
        await this.createNotification(
          5,
          keyMapList,
          'Candidate Moved',
          this.notificationRedirectsLinks.Position + destinationEntityId
        );
      } else {
        await this.createNotification(
          5,
          keyMapList,
          'Candidate Moved',
          this.notificationRedirectsLinks.Pool + destinationEntityId
        );
      }
    });
    return {
      success: true,
    };
  };

  deleteApplication = async ({ userId, jobId, applicantId }) => {
    const updateObject = {
      IsDeleted: true,
      ModifiedBy: userId,
      ModifiedDate: Date.now(),
    };
    await this.models.applications.update(updateObject, {
      where: {
        JobID: jobId,
        applicantID: applicantId,
      },
    });
    return {
      success: true,
    };
  };
  deleteApplicants = async ({ userId, applicantIdList }) => {
    // 'Candidate Deleted',
    //   'The following Candidate/Candidates were deleted by User {UserName}: {DeletedList}';

    const applicantsIds = [];
    const keyMapList = [];
    const DeletedList = [];
    const createdByUsersIds = [];
    const deletingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    for (const applicant of applicantIdList) {
      applicantsIds.push(applicant.ID);
    }
    const applicantsData = await this.models.applicants.findAll({
      attributes: ['CreatedBy', 'FullName'],
      where: {
        ID: applicantsIds,
      },
    });
    for (const applicant of applicantsData) {
      DeletedList.push(applicant.FullName);
      if (!createdByUsersIds.includes(applicant.CreatedBy)) {
        createdByUsersIds.push(applicant.CreatedBy);
      }
    }
    const createdByUsers = await this.models.users.findAll({
      attributes: ['ID', 'EmailAddress'],
      where: {
        ID: createdByUsersIds,
      },
    });
    for (const user of createdByUsers) {
      keyMapList.push({
        UserID: user.ID,
        Email: user.EmailAddress,
        DeletedList: DeletedList,
        UserName: deletingUser.Name,
      });
    }
    await this.sequelize.transaction(async (t) => {
      const updateObject = {
        IsDeleted: true,
        ModifiedBy: userId,
        ModifiedDate: Date.now(),
      };
      for (const applicant of applicantIdList) {
        await this.models.applications.update(updateObject, {
          where: {
            ApplicantID: parseInt(applicant.ID),
          },
          transaction: t,
        });
        await this.models.candidatePools.update(updateObject, {
          where: {
            ApplicantID: parseInt(applicant.ID),
          },
          transaction: t,
        });
        await this.models.applicants.update(updateObject, {
          where: {
            ID: parseInt(applicant.ID),
          },
          transaction: t,
        });
      }
      await this.createNotification(5, keyMapList, 'Candidate Deleted');
    });
    return {
      success: true,
    };
  };
  deleteExperience = async ({ id, userId }) => {
    const setObject = {
      IsDeleted: 1,
      ModifiedBy: userId,
      ModifiedDate: Date.now(),
    };
    await this.models.candidateWorkingExperience.update(setObject, {
      where: {
        ID: parseInt(id),
      },
    });
    return {
      success: true,
    };
  };
  deleteEducation = async ({ id, userId }) => {
    const setObject = {
      IsDeleted: 1,
      ModifiedBy: userId,
      ModifiedDate: Date.now(),
    };
    await this.models.candidateEducation.update(setObject, {
      where: {
        ID: parseInt(id),
      },
    });
    return {
      success: true,
    };
  };

  verifyOTP = async ({ email, jobId, expectedSalary, otp }) => {
    const applicant = await this.models.applicants.findOne({
      where: {
        Email: email,
      },
    });

    if (applicant.OTP !== otp.toString())
      throw new BadRequestError('Invalid OTP');
    const expirationDate = new Date(applicant.OTPExpiry);
    const currentDate = new Date();
    if (expirationDate.getTime() < currentDate.getTime()) {
      throw new BadRequestError('OTP Expired');
    }
    const setApplicantObject = {
      IsVerified: 1,
    };
    await this.sequelize.transaction(async (t) => {
      await this.models.applicants.update(
        setApplicantObject,
        {
          where: { ID: applicant.ID },
        },
        { transaction: t }
      );
      const stageId = await this.getJobPipelineFirstStageId(jobId);

      await this.models.applications.create(
        {
          JobID: jobId,
          ApplicantID: applicant.ID,
          ExpectedSalary: expectedSalary,
          StageID: parseInt(stageId),
        },
        { transaction: t }
      );
    });

    return {
      success: true,
    };
  };

  resendOTP = async ({ email }) => {
    const applicant = await this.models.applicants.findOne({
      where: {
        Email: email,
      },
    });

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const message = {
      to: email,
      from: this.senderEmail,
      subject: 'ExactCareers Signup',
      html: `<div>
        <p>Thankyou for applying for this job through exact careers. Use the following code to proceed further. </p>
        <strong>${verificationCode}</strong>
      <div>`,
    };
    await this.sendEmail(message);

    const datetime = new Date();
    datetime.setHours(datetime.getHours() + 1);

    const setApplicantObject = {
      OTP: verificationCode,
      OTPExpiry: datetime,
    };
    await this.models.applicants.update(setApplicantObject, {
      where: { ID: applicant.ID },
    });

    return {
      newOtp: verificationCode,
      success: true,
    };
  };

  getJobPipelineFirstStageId = async (jobId) => {
    const results = await this.models.jobs.findAll({
      attributes: ['ID'],
      include: [
        {
          attributes: ['ID'],
          model: this.models.pipelines,
          include: [
            {
              attributes: ['ID'],
              model: this.models.stages,
            },
          ],
        },
      ],
      where: {
        ID: jobId,
      },
    });
    const stageId = Object.values(results[0].Pipeline.Stages)[1].ID;
    return stageId;
  };

  calculateApplicantRelevancyScore = async ({ applicantId, jobId }) => {
    const jobDescription = await this.models.jobs.findOne({
      attributes: ['Description'],
      where: {
        ID: jobId,
      },
    });
    const candidateCV = await this.models.candidateDocuments.findOne({
      where: {
        DocumentTypeID: 1,
        ApplicantID: applicantId,
        IsDeleted: false,
      },
    });
    if (candidateCV) {
      try {
        let parsedInformation = await getRelevancyScore(
          candidateCV.Path,
          jobDescription.Description
        );
        return {
          parsedInformation,
          success: true,
        };
      } catch (error) {
        return undefined;
      }
    }
  };

  parseApplicantResume = async (resume) => {
    let parsedInformation = await parseResume(resume.path);
    parsedInformation = JSON.parse(parsedInformation);
    return {
      parsedInformation,
      success: true,
    };
  };

  fetchCityStateCountryByName = async ({ name }) => {
    const results = await this.sequelize.query(
      'CALL SP_Get_CitiesStateCountry(:cityName)',
      {
        replacements: { cityName: name },
        type: this.sequelize.QueryTypes.RAW,
      }
    );
    return {
      results,
      success: true,
    };
  };
}

module.exports = ApplicantsService;

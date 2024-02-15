const { include } = require('underscore');
const { BadRequestError } = require('../utils/errorTypes');
const { Op } = require('sequelize');

class ScoreCardService {
  constructor(models, sequelize) {
    this.models = models;
    this.sequelize = sequelize;
  }
  checkSectionduplicatesExist = (sections) => {
    const sectionNamesCounts = {};
    for (const section of sections) {
      if (!sectionNamesCounts[section.Name]) {
        sectionNamesCounts[section.Name] = 0;
      }
      sectionNamesCounts[section.Name] += 1;
      if (sectionNamesCounts[section.Name] > 1) {
        return true;
      }
    }
    return false;
  };
  checkItemsduplicatesExist = (items) => {
    const ItemNamesCounts = {};
    for (const item of items) {
      if (!ItemNamesCounts[item.Name]) {
        ItemNamesCounts[item.Name] = 0;
      }
      ItemNamesCounts[item.Name] += 1;
      if (ItemNamesCounts[item.Name] > 1) {
        return true;
      }
    }
    return false;
  };

  fetchandCreateUserTeamScorecard = async ({ applicantId }) => {
    const applicationData = await this.models.applications.findOne({
      attributes: ['Score', 'ID'],
      where: {
        ApplicantID: applicantId,
        IsDeleted: false,
      },
    });
    const overallScore = applicationData;
    const overallRatingsData = await this.models.candidateOverallScores.findAll(
      {
        attributes: [['CreatedBy', 'UserID'], 'Thoughts', 'AnswerID'],
        include: [
          {
            attributes: ['ID', 'Name', 'PictureURL'],
            required: false,
            model: this.models.users,
          },
          {
            required: false,
            model: this.models.scoreCardAnswers,
          },
        ],
        where: {
          ApplicantID: applicantId,
        },
        order: [['ID', 'DESC']],
      }
    );
    const RatingsData = await this.models.candidateScores.findAll({
      attributes: [['CreatedBy', 'UserID'], 'SectionItemID', 'AnswerID'],
      include: [
        {
          attributes: ['ID', 'Name'],
          required: false,
          model: this.models.sectionItems,
          include: [
            {
              attributes: ['ID', 'Name'],
              required: false,
              model: this.models.sections,
            },
          ],
          
        },
        {
          required: false,
          model: this.models.scoreCardAnswers,
        },
        {
          required: false,
          model: this.models.users,
        },
      ],
      where: {
        ApplicationID: applicationData.ID,
        IsDeleted: false,
      },
    });
    const overallRatingsGridMap = {
      'Very Good': { count: 0, percentage: 0, users: [] },
      Good: { count: 0, percentage: 0, users: [] },
      Average: { count: 0, percentage: 0, users: [] },
      Poor: { count: 0, percentage: 0, users: [] },
      'Very Poor': { count: 0, percentage: 0, users: [] },
    };
    for (const rating of overallRatingsData) {
      overallRatingsGridMap[rating.ScoreCardAnswer.Name].count += 1;
      overallRatingsGridMap[rating.ScoreCardAnswer.Name].users.push(
        rating.User
      );
    }
    for (const ratingKey in overallRatingsGridMap) {
      const value =
        (overallRatingsGridMap[ratingKey].count / overallRatingsData.length) *
        100;

      overallRatingsGridMap[ratingKey].percentage =
        value % 1 !== 0 ? value.toFixed(2) : Math.floor(value);
    }
    const sectionRatings = {};
    for (const rating of RatingsData) {
      if (!sectionRatings[rating.SectionItem.Section.Name]) {
        sectionRatings[rating.SectionItem.Section.Name] = {};
      }
    }
    for (const rating of RatingsData) {
      const section = rating.SectionItem.Section.Name;
      const sectionItemName = rating.SectionItem.Name;
      if (!sectionRatings[section].hasOwnProperty(sectionItemName)) {
        sectionRatings[section][sectionItemName] = {
          totalScores: 0,
          averageScore: 0,
          ratingNames: [],
          userName: [],
        };
      }
      sectionRatings[section][sectionItemName].totalScores +=
        rating.ScoreCardAnswer.Points;
      sectionRatings[section][sectionItemName].ratingNames.push(
        rating.ScoreCardAnswer.Name
      );
      sectionRatings[section][sectionItemName].userName.push(rating.User.Name);
    }
    for (const sectionKey in sectionRatings) {
      for (const sectionItemKey in sectionRatings[sectionKey]) {
        sectionRatings[sectionKey][sectionItemKey].averageScore =
          sectionRatings[sectionKey][sectionItemKey].totalScores /
          overallRatingsData.length;
      }
    }

    return {
      overallRatingsGridMap,
      overallScore,
      sectionRatings,
      overallRatingsData,
      success: true,
    };
  };

  fetchUserCandidateScorecards = async ({
    userId,
    applicationId,
    jobId,
    applicantId,
  }) => {
    const applicantScoreCardsData = await this.models.applications.findOne({
      attributes: ['ID', 'StageID'],
      include: [
        {
          required: true,
          model: this.models.jobs,
          attributes: ['ID', 'Title'],
          include: [
            {
              retuired: true,
              model: this.models.scoreCards,
              include: [
                {
                  required: true,
                  model: this.models.sections,
                  include: [
                    {
                      required: true,
                      model: this.models.sectionItems,
                      include: [
                        {
                          required: false,
                          model: this.models.candidateScores,
                          include: [
                            {
                              required: false,
                              model: this.models.scoreCardAnswers,
                            },
                          ],
                          where: {
                            CreatedBy: parseInt(userId),
                            ApplicationID: parseInt(applicationId),
                            IsDeleted: false,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          where: {
            ID: parseInt(jobId),
            IsDeleted: false,
          },
        },
      ],
      where: {
        ID: parseInt(applicationId),
        IsDeleted: false,
      },
    });
    const scoreCardsCandidateOverallData =
      await this.models.candidateOverallScores.findOne({
        include: [
          {
            required: false,
            model: this.models.scoreCardAnswers,
          },
        ],
        where: {
          CreatedBy: userId,
          ApplicantID: applicantId,
        },
      });
    const scoreCardAnswers = await this.models.scoreCardAnswers.findAll({});

    return {
      applicantScoreCardsData,
      scoreCardsCandidateOverallData,
      scoreCardAnswers,
      success: true,
    };
  };
  editUserCandidateScorecards = async ({
    userId,
    applicantId,
    applicationId,
    overallAnswerId,
    userCandidateScores,
    jobId,
    thoughts,
  }) => {
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      for (const userCandidateScore of userCandidateScores) {
        let itemScore = await this.models.candidateScores.findOne({
          where: {
            SectionItemID: userCandidateScore.SectionItemID,
            ApplicationID: applicationId,
            CreatedBy: userId,
          },
        });

        if (itemScore) {
          await this.models.candidateScores.update(
            {
              AnswerID: userCandidateScore.AnswerID,
              ModifiedBy: userId,
              ModifiedDate: currentDate,
              IsDeleted: false,
            },
            {
              where: {
                SectionItemID: userCandidateScore.SectionItemID,
                ApplicationID: applicationId,
                CreatedBy: userId,
              },
              transaction: t,
            }
          );
        } else {
          await this.models.candidateScores.create(
            {
              ApplicationID: applicationId,
              AnswerID: userCandidateScore.AnswerID,
              SectionItemID: userCandidateScore.SectionItemID,
              CreatedBy: userId,
              CreatedDate: currentDate,
            },
            {
              transaction: t,
            }
          );
        }
      }

      let existingCandidateSectionIds = userCandidateScores.map(
        (item) => item.SectionItemID
      );
      await this.models.candidateScores.update(
        {
          IsDeleted: true,
          ModifiedBy: userId,
          ModifiedDate: currentDate,
        },
        {
          where: {
            SectionItemID: { [Op.notIn]: existingCandidateSectionIds },
            ApplicationID: applicationId,
          },
          transaction: t,
        }
      );

      await this.models.candidateOverallScores.update(
        {
          AnswerID: overallAnswerId,
          Thoughts: thoughts,
          ModifiedBy: userId,
          ModifiedDate: currentDate,
        },
        {
          where: {
            ApplicantID: applicantId,
            CreatedBy: userId,
          },
          transaction: t,
        }
      );
    });
    const overallRatingsData = await this.models.candidateOverallScores.findAll(
      {
        attributes: ['Thoughts', 'AnswerID'],
        include: [
          {
            attributes: ['ID', 'Name'],
            required: false,
            model: this.models.users,
          },
          {
            required: false,
            model: this.models.scoreCardAnswers,
          },
        ],
        where: {
          ApplicantID: applicantId,
        },
      }
    );
    let overallScore = 0;
    for (const rating of overallRatingsData) {
      overallScore += rating.ScoreCardAnswer.Points;
    }
    let calculateValue = overallScore / overallRatingsData.length;
    overallScore =
      calculateValue % 1 !== 0
        ? calculateValue.toFixed(1)
        : Math.floor(calculateValue);
    await this.models.applications.update(
      {
        Score: overallScore,
      },
      {
        where: { ApplicantID: applicantId },
      }
    );
    return {
      success: true,
    };
  };
  addUserCandidateScorecards = async ({
    userId,
    applicantId,
    applicationId,
    overallAnswerId,
    userCandidateScores,
    jobId,
    thoughts,
  }) => {
    const answerScore = await this.models.scoreCardAnswers.findOne({
      where: {
        ID: overallAnswerId,
      },
    });
    const overallRatingsData = await this.models.candidateOverallScores.findAll(
      {
        attributes: ['Thoughts', 'AnswerID'],
        include: [
          {
            attributes: ['ID', 'Name'],
            required: false,
            model: this.models.users,
          },
          {
            required: false,
            model: this.models.scoreCardAnswers,
          },
        ],
        where: {
          ApplicantID: applicantId,
        },
      }
    );
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      const sequelizeCandidateScoreBulkData = [];
      for (const userCandidateScore of userCandidateScores) {
        sequelizeCandidateScoreBulkData.push({
          ApplicationID: applicationId,
          AnswerID: userCandidateScore.AnswerID,
          SectionItemID: userCandidateScore.SectionItemID,
          CreatedBy: userId,
          CreatedDate: currentDate,
        });
      }
      await this.models.candidateScores.bulkCreate(
        sequelizeCandidateScoreBulkData,
        {
          transaction: t,
        }
      );
      await this.models.candidateOverallScores.create(
        {
          ApplicantID: applicantId,
          AnswerID: overallAnswerId,
          Thoughts: thoughts,
          CreatedBy: userId,
          CreatedDate: currentDate,
        },
        {
          transaction: t,
        }
      );
      let overallScore = 0;
      for (const rating of overallRatingsData) {
        overallScore += rating.ScoreCardAnswer.Points;
      }
      overallScore += answerScore.Points;
      const scoresLength = overallRatingsData.length + 1;

      let calculateValue = overallScore / scoresLength;
      overallScore =
        calculateValue % 1 !== 0
          ? calculateValue.toFixed(1)
          : Math.floor(calculateValue);
      await this.models.applications.update(
        {
          Score: overallScore,
        },
        {
          where: { ApplicantID: applicantId },
          transaction: t,
        }
      );
    });
    return {
      success: true,
    };
  };

  createScoreCard = async ({ scoreCardName, userId, companyId, sections }) => {
    const currentDate = Date.now();
    const scoreCardData = await this.models.scoreCards.findOne({
      where: {
        Name: scoreCardName,
        CompanyID: companyId,
      },
    });
    if (scoreCardData) {
      throw new BadRequestError('Score Card with this name already exists');
    }
    if (this.checkSectionduplicatesExist(sections)) {
      throw new BadRequestError(
        'section names can not be same in a score card'
      );
    }
    await this.sequelize.transaction(async (t) => {
      const scoreCard = await this.models.scoreCards.create(
        {
          Name: scoreCardName,
          CreatedBy: userId,
          CreatedDate: currentDate,
          CompanyID: companyId,
        },
        { transaction: t }
      );
      for (const section of sections) {
        if (this.checkItemsduplicatesExist(section.Items)) {
          throw new BadRequestError('item names can not be same in score card');
        }
        const createdSection = await this.models.sections.create(
          {
            Name: section.Name,
            ScoreCardID: parseInt(scoreCard.ID),
            CreatedBy: userId,
            CreatedDate: currentDate,
          },
          { transaction: t }
        );
        const sequelizeNewItemBulkData = [];
        for (const item of section.Items) {
          sequelizeNewItemBulkData.push({
            Name: item.Name,
            SectionID: parseInt(createdSection.ID),
            IsComment: false,
            CreatedBy: userId,
            CreatedDate: currentDate,
          });
        }
        await this.models.sectionItems.bulkCreate(sequelizeNewItemBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };
  updateScoreCard = async ({
    companyId,
    scoreCardName,
    scoreCardId,
    userId,
    sections,
    deletedItems,
    deletedSections,
  }) => {
    const scoreCardData = await this.models.scoreCards.findOne({
      where: {
        Name: scoreCardName,
        CompanyID: companyId,
        ID: {
          [Op.not]: scoreCardId,
        },
      },
    });
    if (scoreCardData) {
      throw new BadRequestError('Score Card with this name already exists');
    }
    if (this.checkSectionduplicatesExist(sections)) {
      throw new BadRequestError(
        'section names can not be same in a score card'
      );
    }
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      await this.models.scoreCards.update(
        { Name: scoreCardName, ModifiedDate: currentDate, ModifiedBy: userId },
        {
          where: {
            ID: scoreCardId,
          },
          transaction: t,
        }
      );
      if (deletedSections.length > 0) {
        await this.models.sections.update(
          { IsDeleted: true, ModifiedDate: currentDate, ModifiedBy: userId },
          {
            where: {
              ID: deletedSections,
            },
            transaction: t,
          }
        );
      }
      for (const section of sections) {
        if (this.checkItemsduplicatesExist(section.Items)) {
          throw new BadRequestError('item names can not be same in score card');
        }
        if (!section.ID) {
          const createdSection = await this.models.sections.create(
            {
              Name: section.Name,
              ScoreCardID: parseInt(scoreCardId),
              CreatedBy: userId,
              CreatedDate: currentDate,
            },
            { transaction: t }
          );
          const sequelizeNewItemBulkData = [];
          for (const item of section.Items) {
            sequelizeNewItemBulkData.push({
              Name: item.Name,
              SectionID: parseInt(createdSection.ID),
              IsComment: false,
              CreatedBy: userId,
              CreatedDate: currentDate,
            });
          }
          await this.models.sectionItems.bulkCreate(sequelizeNewItemBulkData, {
            transaction: t,
          });
        } else {
          await this.models.sections.update(
            {
              Name: section.Name,
              ModifiedDate: currentDate,
              ModifiedBy: userId,
            },
            {
              where: {
                ID: parseInt(section.ID),
              },
              transaction: t,
            }
          );
          if (deletedItems.length > 0) {
            await this.models.sectionItems.update(
              {
                IsDeleted: true,
                ModifiedDate: currentDate,
                ModifiedBy: userId,
              },
              {
                where: {
                  ID: deletedItems,
                },
                transaction: t,
              }
            );
          }
          for (const item of section.Items) {
            if (!item.ID) {
              await this.models.sectionItems.create(
                {
                  Name: item.Name,
                  SectionID: parseInt(section.ID),
                  IsComment: false,
                  CreatedBy: userId,
                  CreatedDate: currentDate,
                },
                { transaction: t }
              );
            } else {
              await this.models.sectionItems.update(
                {
                  Name: item.Name,
                  ModifiedBy: userId,
                  ModifiedDate: currentDate,
                },
                {
                  where: {
                    ID: parseInt(item.ID),
                  },
                  transaction: t,
                }
              );
            }
          }
        }
      }
    });
    return {
      success: true,
    };
  };
  copyScoreCard = async ({ scoreCardName, scoreCardId, companyId, userId }) => {
    if (!scoreCardName) {
      throw new BadRequestError('score card must have a name');
    }
    scoreCardName += ' - Copy';
    const scoreCardExists = await this.models.scoreCards.findOne({
      where: {
        Name: scoreCardName,
        IsDeleted: false,
      },
    });
    if (scoreCardExists) {
      throw new BadRequestError('a score card copy already exists');
    }
    const scoreCardData = await this.fetchScoreCard({ scoreCardId, companyId });
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      const scoreCard = await this.models.scoreCards.create(
        {
          Name: scoreCardName,
          CreatedBy: userId,
          CreatedDate: currentDate,
          CompanyID: companyId,
        },
        { transaction: t }
      );
      for (const section of scoreCardData.scoreCard.Sections) {
        const createdSection = await this.models.sections.create(
          {
            Name: section.Name,
            ScoreCardID: parseInt(scoreCard.ID),
            CreatedBy: userId,
            CreatedDate: currentDate,
          },
          { transaction: t }
        );
        const sequelizeNewItemBulkData = [];
        for (const item of section.SectionItems) {
          sequelizeNewItemBulkData.push({
            Name: item.Name,
            SectionID: parseInt(createdSection.ID),
            IsComment: false,
            CreatedBy: userId,
            CreatedDate: currentDate,
          });
        }
        await this.models.sectionItems.bulkCreate(sequelizeNewItemBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };
  fetchScoreCard = async ({ scoreCardId, companyId }) => {
    const scoreCard = await this.models.scoreCards.findOne({
      attributes: ['ID', 'Name', 'CompanyID', 'IsDeleted'],
      include: [
        {
          attributes: ['ID', 'Name', 'IsDeleted'],
          model: this.models.sections,
          include: [
            {
              attributes: ['ID', 'Name', 'IsComment'],
              model: this.models.sectionItems,
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
      where: {
        ID: parseInt(scoreCardId),
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      scoreCard,
      success: true,
    };
  };
  fetchAllScoreCards = async ({ companyId }) => {
    const scoreCards = await this.models.scoreCards.findAll({
      attributes: ['ID', 'Name', 'CompanyID', 'IsDeleted'],
      include: [
        {
          attributes: ['ID', 'Name', 'IsDeleted'],
          model: this.models.sections,
          include: [
            {
              attributes: ['ID', 'Name', 'IsComment', 'IsDeleted'],
              model: this.models.sectionItems,
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
      where: {
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      scoreCards,
      success: true,
    };
  };
  deleteScoreCard = async ({ scoreCardId, userId }) => {
    const scoreCardData = await this.models.scoreCards.findOne({
      where: {
        ID: parseInt(scoreCardId),
      },
    });
    if (!scoreCardData) {
      return new BadRequestError('score card does not exist');
    }
    await this.models.scoreCards.update(
      {
        IsDeleted: true,
        ModifiedDate: Date.now(),
        ModifiedBy: userId,
      },
      {
        where: {
          ID: parseInt(scoreCardId),
        },
      }
    );
    return {
      success: true,
    };
  };
}

module.exports = ScoreCardService;

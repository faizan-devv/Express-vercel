const { BadRequestError, ForbiddenError } = require('../utils/errorTypes');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const BaseService = require('./baseService');

class JobsService extends BaseService {
  constructor(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack) {
    super(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack);
  }

  populateDropDowns = async ({ companyId }) => {
    const results = await this.sequelize.query(
      'CALL SP_Get_Create_Job_Dropdowns_Data(:p_companyId)',
      {
        replacements: { p_companyId: parseInt(companyId) },
        type: this.sequelize.QueryTypes.RAW,
      }
    );
    return {
      results,
      success: true,
    };
  };

  prefetchEditJobData = async ({ jobId }) => {
    const results = await this.models.jobs.findAll({
      include: [
        {
          model: this.models.jobHiringTeam,
          include: [
            {
              model: this.models.users,
              attributes: ['ID', 'Name', 'PictureURL'],
              where: {
                IsDeleted: false,
                IsVerified: true,
              },
              required: false,
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
                      required: false,
                      model: this.models.users,
                      attributes: ['ID', 'Name', 'PictureURL'],
                      where: {
                        IsDeleted: false,
                        IsVerified: true,
                      },
                    },
                  ],
                  where: { IsDeleted: false },
                  required: false,
                },
              ],
              where: { IsDeleted: false },
              required: false,
            },
          ],
          where: { IsDeleted: false },
          required: false,
        },
        {
          model: this.models.pipelines,
          attributes: ['ID', 'Name'],
        },
        {
          model: this.models.department,
          attributes: ['ID', 'Name'],
        },
        {
          model: this.models.jobPublishStatuses,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.jobStatuses,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.scoreCards,
          required: false,
          attributes: ['ID', 'Name'],
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.salaryPeriods,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.jobTypes,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.employmentTypes,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.jobTime,
          attributes: ['ID', 'Name'],
        },
        {
          model: this.models.currencies,
          attributes: ['ID', 'Name'],
        },
        {
          attributes: ['CompanyID', 'AddressLine1', 'AddressLine2'],
          model: this.models.companyLocations,
          required: false,
          include: [
            {
              attributes: ['ID', 'Name'],
              model: this.models.cities,
            },
            {
              attributes: ['ID', 'Name'],
              model: this.models.countries,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.jobTags,
          attributes: ['JobID'],
          include: [
            {
              model: this.models.tags,
              attributes: ['ID', 'Name'],
            },
          ],
        },
        {
          model: this.models.education,
          attributes: ['ID', 'Title'],
        },
        {
          model: this.models.jobExperienceLevel,
          attributes: ['ID', 'Name'],
        },
      ],
      where: {
        ID: parseInt(jobId),
      },
    });
    return {
      results,
      success: true,
    };
  };

  jobMapperValidation = (requestBody) => {
    const requiredFieldsMap = {
      // a schema defined dummy object to check if required fields are present in the req.body object and also non null values for job record are also present
      companyId: 0,
      title: '',
      departmentId: 0,
      jobTypeId: 0,
      employmentTypeId: 0,
      locationId: 0,
      description: '',
      numberOfPositions: 0,
      lastDate: '',
      minSalary: 0,
      maxSalary: 0,
      currencyId: 0,
      shiftTime: '',
      minimumEducationId: 0,
      minimumExperienceId: 0,
      pipelineId: 0,
      scoreCardId: 0,
      internalId: 0,
      departmentId: 0,
      salaryPeriodId: 0,
      publishStatusId: 0,
      jobStatusId: 0,
    };

    for (const field of Object.keys(requiredFieldsMap)) {
      if (
        !requestBody.hasOwnProperty(field) ||
        requestBody[field] === undefined
      ) {
        throw new BadRequestError(
          `Required Field or Non Null Db Column '${field}' is either missing or is undefined `
        );
      }
    }
  };

  createJobDescriptionTemplate = async ({
    title,
    companyId,
    description,
    userId,
  }) => {
    const results = await this.models.jobDescriptionTemplates.findOne({
      where: {
        Title: title,
      },
    });
    if (results) {
      throw new BadRequestError(
        'description template with the same name already exists'
      );
    }
    await this.models.jobDescriptionTemplates.create({
      Title: title,
      CompanyID: companyId,
      Description: description,
      CreatedBy: userId,
      CreatedDate: Date.now(),
    });
    return {
      success: true,
    };
  };
  copyJobDescriptionTemplate = async ({
    title,
    companyId,
    templateId,
    userId,
  }) => {
    title += ' - Copy';
    const template = await this.models.jobDescriptionTemplates.findOne({
      where: {
        Title: title,
      },
    });
    if (template) {
      throw new BadRequestError(
        'a copy of this template has already been made'
      );
    }
    const templateData = await this.models.jobDescriptionTemplates.findOne({
      where: {
        ID: templateId,
      },
    });
    await this.models.jobDescriptionTemplates.create({
      Title: title,
      CompanyID: companyId,
      Description: templateData.Description,
      CreatedBy: userId,
      CreatedDate: Date.now(),
    });
    return {
      success: true,
    };
  };
  fetchKanbanBoardData = async ({
    isPosition,
    entityId,
    filters,
    userId,
    companyId,
  }) => {
    let applicationsWhere = {};
    if (filters.applicants) {
      filters.applicants.FullName = {
        [Op.like]: `%${filters.applicants.FullName}%`,
      };
      applicationsWhere = filters.applicants;
    }
    let kanbanBoardData;
    let info = null;

    if (isPosition) {
      kanbanBoardData = await this.models.jobs.findOne({
        attributes: ['ID', 'Title'],
        include: [
          {
            attributes: ['ID', 'Name'],
            model: this.models.pipelines,
            include: [
              {
                attributes: ['ID', 'Name', 'StageOrder', 'Icon'],
                model: this.models.stages,
                include: [
                  {
                    attributes: [
                      'ID',
                      'ApplicantID',
                      'StageID',
                      'JobID',
                      'CreatedDate',
                      'ModifiedDate',
                      'RelevancyScore',
                      'Score',
                    ],
                    model: this.models.applications,
                    required: false,
                    include: [
                      {
                        required: false,
                        model: this.models.usersJobsStarCandidates,
                        where: {
                          IsDeleted: false,
                          JobID: parseInt(entityId),
                          UserID: parseInt(userId),
                        },
                      },
                      {
                        attributes: ['ID', 'FullName', 'PhoneNumber'],
                        model: this.models.applicants,
                        required: true,
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
                          ...applicationsWhere,
                          IsDeleted: false,
                        },
                      },
                    ],
                    where: {
                      ApplicantStatusID: 2,
                      JobID: parseInt(entityId),
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
        ],
        where: {
          ID: parseInt(entityId),
          CompanyID: companyId,
        },
      });
      info = await this.models.jobs.findOne({
        attributes: [
          'ID',
          'Title',
          'JobStatusID',
          'LastDate',
          'CreatedDate',
          'URLHandle',
        ],
        include: [
          {
            model: this.models.jobStatuses,
            attributes: ['ID', 'Title'],
          },
          {
            required: false,
            attributes: ['IsStar', 'UserID', 'JobID'],
            model: this.models.userStarJobs,
            where: { UserId: userId, IsDeleted: false },
          },
          {
            attributes: [
              'CompanyID',
              'AddressLine1',
              'AddressLine2',
              'CountryID',
              'CityID',
            ],
            model: this.models.companyLocations,
            include: [
              {
                attributes: ['Name'],
                model: this.models.cities,
              },
              {
                attributes: ['Name'],
                model: this.models.states,
              },
              {
                attributes: ['Name'],
                model: this.models.countries,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
                attributes: ['ID', 'Name', 'PictureURL'],
                where: {
                  IsDeleted: false,
                  IsVerified: true,
                },
                required: false,
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
                        required: false,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: {
                          IsDeleted: false,
                          IsVerified: true,
                        },
                      },
                    ],
                    where: { IsDeleted: false },
                    required: false,
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
        ],
        where: {
          ID: parseInt(entityId),
          CompanyID: companyId,
        },
      });
    } else {
      kanbanBoardData = await this.models.pools.findOne({
        attributes: ['ID', 'Name'],
        include: [
          {
            attributes: ['ID', 'Name'],
            model: this.models.pipelines,
            include: [
              {
                attributes: ['ID', 'Name', 'StageOrder', 'Icon'],
                model: this.models.stages,
                include: [
                  {
                    attributes: [
                      'ID',
                      'ApplicantID',
                      'StageID',
                      'PoolID',
                      'CreatedDate',
                      'ModifiedDate',
                    ],
                    model: this.models.candidatePools,
                    required: false,
                    include: [
                      {
                        attributes: ['ID', 'FullName', 'PhoneNumber'],
                        model: this.models.applicants,
                        required: true,
                        include: [
                          {
                            model: this.models.candidateWorkingExperience,
                            order: [['StartDate', 'DESC']],
                            required: false,
                          },
                        ],
                        where: { ...applicationsWhere },
                      },
                    ],
                    where: {
                      PoolID: parseInt(entityId),
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
        ],
        where: {
          ID: parseInt(entityId),
          CompanyID: companyId,
        },
      });

      info = await this.models.pools.findOne({
        attributes: ['ID', 'Name'],
        where: {
          ID: parseInt(entityId),
          CompanyID: companyId,
        },
      });
    }
    let missingStageCount = 0;
    for (const stage of kanbanBoardData.Pipeline.Stages) {
      if (stage.Name === 'Missing Stage') {
        missingStageCount =
          (stage.Applications?.length || 0) +
          (stage.CandidatePools?.length || 0);
      }
    }
    return {
      missingStageCount,
      kanbanBoardData,
      info,
      success: true,
    };
  };

  fetchJobTeamData = async ({ companyId, jobId }) => {
    const results = await this.sequelize.query(
      'CALL SP_Get_TeamMembers(:companyId, :jobId)',
      {
        replacements: { companyId: parseInt(companyId), jobId },
        type: this.sequelize.QueryTypes.RAW,
      }
    );
    return {
      results,
      success: true,
    };
  };

  fetchPublicJobTypes = async () => {
    const results = await this.models.jobTypes.findAll();
    return {
      results,
      success: true,
    };
  };

  fetchPublicJobs = async ({ offset, limit, companyID, filters }) => {
    let jobTypeWhere = {};
    let departmentIDWhere = {};
    const locationWhere = {
      IsDeleted: false,
    };
    if (filters.location) {
      locationWhere.CityID = filters.location.CityID;
    }
    if (filters.jobType) {
      jobTypeWhere = filters.jobType;
    }
    const whereClause = {
      IsDeleted: false,
      PublishStatusID: 2,
      JobStatusID: 1,
      CompanyID: companyID,
    };
    if (filters.departmentID) {
      whereClause.DepartmentID = filters.departmentID;
    }
    const results = await this.models.jobs.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      include: [
        {
          required: true,
          attributes: ['Name'],
          model: this.models.companies,
          where: {
            ID: companyID,
          },
        },
        {
          required: false,
          model: this.models.jobTypes,
          where: jobTypeWhere,
        },
        {
          model: this.models.education,
          required: false,
        },
        {
          model: this.models.jobExperienceLevel,
          required: false,
        },
        {
          attributes: [
            'CompanyID',
            'AddressLine1',
            'AddressLine2',
            'CountryID',
            'CityID',
          ],
          model: this.models.companyLocations,
          include: [
            {
              attributes: ['Name'],
              model: this.models.cities,
            },
            {
              attributes: ['Name'],
              model: this.models.countries,
            },
          ],
          where: locationWhere,
          required: filters.location === '' ? false : true,
        },
        {
          attributes: ['ID', 'JobID'],
          model: this.models.jobTags,
          required: false,
          include: [
            {
              attributes: ['Name'],
              model: this.models.tags,
            },
          ],
          where: { IsDeleted: false },
        },
      ],
      where: whereClause,
      order: [['ID', 'DESC']],
    });
    return {
      results,
      success: true,
    };
  };

  fetchPublicDompanyDepartment = async ({ companyID }) => {
    const result = await this.models.department.findAll({
      include: [
        {
          attributes: ['Title'],
          required: true,
          model: this.models.jobs,
          where: {
            IsDeleted: false,
            CompanyID: companyID,
            PublishStatusID: 2,
            JobStatusID: 1,
          },
        },
      ],
      where: {
        IsDeleted: false,
        CompanyID: companyID,
      },
    });

    return {
      result,
      success: true,
    };
  };

  fetchCompanyLocations = async ({ companyID }) => {
    const result = await this.models.companyLocations.findAll({
      include: [
        {
          attributes: [],
          required: true,
          model: this.models.jobs,
          where: {
            IsDeleted: false,
            CompanyID: companyID,
            PublishStatusID: 2,
            JobStatusID: 1,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.cities,
          where: {
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.countries,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        IsDeleted: false,
        CompanyID: companyID,
      },
    });

    return {
      result,
      success: true,
    };
  };

  fetchPositionCompanyLocations = async ({ companyID }) => {
    const result = await this.models.companyLocations.findAll({
      include: [
        {
          attributes: [],
          required: true,
          model: this.models.jobs,
          where: {
            IsDeleted: false,
            CompanyID: companyID,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.cities,
          where: {
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.countries,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        IsDeleted: false,
        CompanyID: companyID,
      },
    });

    return {
      result,
      success: true,
    };
  };

  fetchInternalAppCompanyLocations = async ({ companyID }) => {
    const result = await this.models.companyLocations.findAll({
      include: [
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.cities,
          where: {
            IsDeleted: false,
          },
        },
        {
          attributes: ['ID', 'Name'],
          required: true,
          model: this.models.countries,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        IsDeleted: false,
        CompanyID: companyID,
      },
    });

    return {
      result,
      success: true,
    };
  };

  fetchJobFromHash = async ({ jobID }) => {
    const result = await this.models.jobs.findOne({
      include: [
        {
          model: this.models.jobHiringTeam,
          include: [
            {
              model: this.models.users,
              attributes: ['Name'],
            },
          ],
        },
        {
          required: false,
          model: this.models.jobTypes,
          attributes: ['Title'],
        },
        {
          required: false,
          model: this.models.employmentTypes,
          attributes: ['Title'],
        },
        {
          required: false,
          model: this.models.jobTime,
          attributes: ['Name'],
        },
        {
          required: false,
          model: this.models.currencies,
          attributes: ['Name', 'Code'],
        },
        {
          required: false,
          attributes: ['CompanyID', 'AddressLine1', 'AddressLine2'],
          model: this.models.companyLocations,
          include: [
            {
              attributes: ['Name'],
              model: this.models.cities,
            },
            {
              attributes: ['Name'],
              model: this.models.countries,
            },
          ],
          where: { IsDeleted: false },
        },
        {
          required: false,
          model: this.models.jobTags,
          attributes: ['JobID'],
          include: [
            {
              model: this.models.tags,
              attributes: ['Name'],
            },
          ],
          where: { IsDeleted: false },
        },
        {
          required: false,
          model: this.models.education,
          attributes: ['Title'],
        },
        {
          required: false,
          model: this.models.jobExperienceLevel,
          attributes: ['Name'],
        },
        {
          required: false,
          model: this.models.department,
          attributes: ['Name', 'ID'],
          where: { IsDeleted: false },
        },
        {
          required: false,
          model: this.models.salaryPeriods,
          attributes: ['Title', 'ID'],
        },
      ],
      where: {
        ID: jobID,
        IsDeleted: false,
        JobStatusID: 1,
      },
    });

    if (result.PublishStatusID !== 2) {
      throw new ForbiddenError('Job is not public');
    }

    return {
      result,
      success: true,
    };
  };

  fetchPaginatedJobsList = async ({
    offset,
    limit,
    companyId,
    userId,
    isAdmin,
    isGlobal,
    filters,
  }) => {
    let jobStatusWhere = {};
    let departmentsWhere = {};
    let locationsWhere = {};
    let nameWhere = {};
    let restrictWhere = {};
    let createdByWhere = {};
    let starPositions = {};
    if (filters.name) {
      nameWhere['Title'] = {
        [Op.like]: `%${filters.name}%`,
      };
    }
    if (filters.jobStatusId) {
      jobStatusWhere = {
        JobStatusID: filters.jobStatusId,
      };
    }
    if (filters.departmentId) {
      departmentsWhere = {
        DepartmentID: filters.departmentId,
      };
    }
    if (filters.locationId) {
      locationsWhere = {
        LocationID: filters.locationId,
      };
    }
    if (filters.showMyPositionsOnly === 3) {
      starPositions = {
        UserID: userId,
        IsDeleted: false,
        IsStar: true,
      };
    }

    let results;

    if ((!isAdmin && !isGlobal) || filters.showMyPositionsOnly === 2) {
      restrictWhere = {
        CreatedBy: userId,
      };
      let jobWhereClause = {
        companyID: companyId,
        IsDeleted: false,
      };

      const inJobTeamWhereClause = {
        CreatedBy: { [Op.ne]: userId },
        ...createdByWhere,
        ...jobWhereClause,
        ...jobStatusWhere,
        ...departmentsWhere,
        ...locationsWhere,
        ...nameWhere,
      };
      const createdByResultsWhereClause = {
        ...createdByWhere,
        ...restrictWhere,
        ...jobWhereClause,
        ...jobStatusWhere,
        ...departmentsWhere,
        ...locationsWhere,
        ...nameWhere,
      };
      const createdByResults = await this.models.jobs.findAndCountAll({
        distinct: true,
        attributes: [
          'ID',
          'Title',
          'CreatedDate',
          'CreatedBy',
          'LastDate',
          'JobStatusID',
          'CompanyID',
          'LocationID',
          'DepartmentID',

          'URLHandle',
        ],
        include: [
          {
            model: this.models.jobStatuses,
            attributes: ['ID', 'Title'],
          },
          {
            model: this.models.department,
            attributes: ['ID', 'Name'],
            where: {
              IsDeleted: false,
            },
            required: false,
          },
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
                attributes: ['ID', 'Name', 'PictureURL'],
                where: {
                  IsDeleted: false,
                  IsVerified: true,
                },
                required: false,
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
                        required: false,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: {
                          IsDeleted: false,
                          IsVerified: true,
                        },
                      },
                    ],
                    where: { IsDeleted: false },
                    required: false,
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
          {
            model: this.models.userStarJobs,
            attributes: ['ID', 'UserID', 'IsStar'],
            where: starPositions,
            required: filters.showMyPositionsOnly === 3 ? true : false,
          },
          {
            model: this.models.jobTypes,
          },
          {
            attributes: ['CompanyID', 'AddressLine1', 'AddressLine2'],
            model: this.models.companyLocations,
            include: [
              {
                attributes: ['Name'],
                model: this.models.cities,
              },
              {
                attributes: ['Name'],
                model: this.models.countries,
              },
            ],
            where: { IsDeleted: false },
          },
          {
            attributes: ['ID', 'JobID'],
            model: this.models.jobTags,
            include: [
              {
                attributes: ['Name'],
                model: this.models.tags,
              },
            ],
          },
        ],
        where: createdByResultsWhereClause,
      });
      const inJobTeamResults = await this.models.jobs.findAndCountAll({
        distinct: true,
        attributes: [
          'ID',
          'Title',
          'CreatedDate',
          'LastDate',
          'JobStatusID',
          'CompanyID',
          'LocationID',
          'DepartmentID',

          'URLHandle',
        ],
        include: [
          {
            model: this.models.department,
            attributes: ['ID', 'Name'],
            where: {
              IsDeleted: false,
            },
            required: false,
          },
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
                attributes: ['ID', 'Name', 'PictureURL'],
                where: {
                  IsDeleted: false,
                  IsVerified: true,
                },
                required: false,
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
                        required: false,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: {
                          IsDeleted: false,
                          IsVerified: true,
                        },
                      },
                    ],
                    where: { IsDeleted: false },
                    required: false,
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
          {
            model: this.models.jobTypes,
          },
          {
            attributes: ['CompanyID', 'AddressLine1', 'AddressLine2'],
            model: this.models.companyLocations,
            include: [
              {
                attributes: ['Name'],
                model: this.models.cities,
              },
              {
                attributes: ['Name'],
                model: this.models.countries,
              },
            ],
            where: { IsDeleted: false },
          },
          {
            attributes: ['ID', 'JobID'],
            model: this.models.jobTags,
            include: [
              {
                attributes: ['Name'],
                model: this.models.tags,
              },
            ],
          },
          {
            model: this.models.userStarJobs,
            attributes: ['ID', 'UserID', 'IsStar'],
            where: starPositions,
            required: filters.showMyPositionsOnly === 3 ? true : false,
          },
        ],
        where: inJobTeamWhereClause,
      });
      let rows = [...createdByResults.rows, ...inJobTeamResults.rows];
      rows = rows.sort((a, b) => b.ID - a.ID);
      rows = rows.slice(offset, offset + limit);
      results = {
        count: createdByResults.count + inJobTeamResults.count,
        rows,
      };
      return {
        results,
        success: true,
      };
    } else {
      let jobWhereClause = {
        companyID: companyId,
        IsDeleted: false,
      };
      jobWhereClause = {
        ...jobWhereClause,
        ...jobStatusWhere,
        ...departmentsWhere,
        ...locationsWhere,
        ...nameWhere,
      };
      results = await this.models.jobs.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'ID',
          'Title',
          'CreatedDate',
          'LastDate',
          'JobStatusID',
          'CompanyID',
          'LocationID',
          'DepartmentID',

          'URLHandle',
        ],
        include: [
          {
            model: this.models.department,
            attributes: ['ID', 'Name'],
            where: {
              IsDeleted: false,
            },
            required: false,
          },
          {
            model: this.models.jobHiringTeam,
            include: [
              {
                model: this.models.users,
                attributes: ['ID', 'Name', 'PictureURL'],
                where: {
                  IsDeleted: false,
                  IsVerified: true,
                },
                required: false,
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
                        required: false,
                        model: this.models.users,
                        attributes: ['ID', 'Name', 'PictureURL'],
                        where: {
                          IsDeleted: false,
                          IsVerified: true,
                        },
                      },
                    ],
                    where: { IsDeleted: false },
                    required: false,
                  },
                ],
                where: { IsDeleted: false },
                required: false,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
          {
            model: this.models.jobTypes,
          },
          {
            model: this.models.jobStatuses,
          },
          {
            attributes: ['CompanyID', 'AddressLine1', 'AddressLine2'],
            model: this.models.companyLocations,
            include: [
              {
                attributes: ['Name'],
                model: this.models.cities,
              },
              {
                attributes: ['Name'],
                model: this.models.countries,
              },
            ],
            where: { IsDeleted: false },
            required: false,
          },
          {
            attributes: ['ID', 'JobID'],
            model: this.models.jobTags,
            include: [
              {
                attributes: ['Name'],
                model: this.models.tags,
              },
            ],
          },
          {
            model: this.models.userStarJobs,
            attributes: ['ID', 'UserID', 'IsStar'],
            where: starPositions,
            required: filters.showMyPositionsOnly === 3 ? true : false,
          },
        ],
        where: jobWhereClause,
        order: [['ID', 'DESC']],
        distinct: true,
      });
      return {
        results,
        success: true,
      };
    }
  };

  createExternalCompanyJob = async () => {
    return {
      success: true,
    };
  };

  createJobDraft = async ({
    jobId,
    userId,
    companyId,
    title,
    jobTypeId,
    employmentTypeId,
    locationId,
    scoreCardId,
    internalId,
    departmentId,
    salaryPeriodId,
    currencyId,
    publishStatusId,
    pipelineId,
    jobStatusId,
    description,
    numberOfPositions,
    lastDate,
    minSalary,
    maxSalary,
    shiftTime,
    minimumEducationId,
    minimumExperienceId,
    isResumeRequired,
    isExpectedSalaryRequired,
    isNameRequired,
    isPhoneRequired,
    isEmailRequired,
    isLinkedInRequired,
    isTestRequired,
    isProfilePictureRequired,
    isCoverLetterRequired,
    tags,
    hiringTeamData,
    pageTitle,
    metaDescription,
    urlHandle,
  }) => {
    if (!title) {
      throw new BadRequestError('Job must have a title');
    }
    if (!jobStatusId) {
      throw new BadRequestError('a job status id must be provided');
    }
    if (!companyId) {
      throw new BadRequestError('a company id must be provided');
    }
    const jobExist = await this.models.jobs.findOne({
      where: {
        CompanyID: companyId,
        Title: title,
        ID: {
          [Op.ne]: jobId,
        },
      },
    });
    if (jobExist) {
      throw new BadRequestError(
        'Job or job draft with same name already exists'
      );
    }

    const companyExists = await this.models.companies.findOne({
      where: {
        ID: companyId,
      },
    });
    if (!companyExists) throw new BadRequestError('Company Does not exist');
    await this.sequelize.transaction(async (t) => {
      let currentJobID = jobId;
      if (!jobId) {
        const fetchJob = await this.models.jobs.create(
          {
            CompanyID: companyId,
            Title: title,
            DepartmentID: departmentId,
            JobTypeID: jobTypeId,
            EmploymentTypeID: employmentTypeId,
            LocationID: locationId,
            Description: description,
            NumberOfPositions:
              numberOfPositions === '' ? null : numberOfPositions,
            LastDate: lastDate.length ? lastDate : null,
            MinSalary: minSalary === '' ? null : minSalary,
            MaxSalary: maxSalary === '' ? null : maxSalary,
            CurrencyID: currencyId,
            ShiftTime: shiftTime,
            MinimumEducationID: minimumEducationId,
            MinimumExperienceID: minimumExperienceId,
            IsResumeRequired: isResumeRequired,
            IsExpectedSalaryRequired: isExpectedSalaryRequired,
            IsNameRequired: isNameRequired,
            IsPhoneRequired: isPhoneRequired,
            IsEmailRequired: isEmailRequired,
            IsLinkedInRequired: isLinkedInRequired,
            IsTestRequired: isTestRequired,
            IsProfilePictureRequired: isProfilePictureRequired,
            IsCoverLetterRequired: isCoverLetterRequired,
            CreatedBy: userId,
            CreatedAt: Date.now(),
            PipelineID: pipelineId,
            ScoreCardID: scoreCardId,
            InternalID: internalId,
            DepartmentID: departmentId,
            SalaryPeriodID: salaryPeriodId,
            PublishStatusID: publishStatusId,
            JobStatusID: jobStatusId,
            PageTitle: pageTitle,
            MetaDescription: metaDescription,
            URLHandle: urlHandle,
          },
          { transaction: t }
        );
        currentJobID = parseInt(fetchJob.ID);
        await fetchJob.save({ transaction: t });
      }

      await this.models.userStarJobs.create(
        {
          UserID: userId,
          JobID: currentJobID,
          IsStar: true,
          IsDeleted: false,
          CreatedBy: userId,
          CreatedDate: Date.now(),
          ModifiedBy: userId,
          ModifiedDate: Date.now(),
        },
        { transaction: t }
      );

      await this.models.jobHiringTeam.destroy(
        {
          where: {
            JobID: currentJobID,
          },
        },
        {
          transaction: t,
        }
      );

      if (hiringTeamData.userIds.length > 0) {
        const sequelizeBulkData = [];
        hiringTeamData.userIds.forEach((Id) => {
          sequelizeBulkData.push({
            JobID: parseInt(currentJobID),
            UserID: Id,
          });
        });
        await this.models.jobHiringTeam.bulkCreate(sequelizeBulkData, {
          transaction: t,
        });
      }
      if (hiringTeamData.teamIds.length > 0) {
        const sequelizeTeamBulkData = [];
        hiringTeamData.teamIds.forEach((Id) => {
          sequelizeTeamBulkData.push({
            JobID: parseInt(currentJobID),
            TeamID: Id,
          });
        });
        await this.models.jobHiringTeam.bulkCreate(sequelizeTeamBulkData, {
          transaction: t,
        });
      }
      await this.models.jobTags.destroy(
        {
          where: {
            JobID: parseInt(currentJobID),
          },
        },
        {
          transaction: t,
        }
      );

      if (tags) {
        const sequelizeJobTagsBulkData = [];
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
            sequelizeJobTagsBulkData.push({
              JobID: parseInt(currentJobID),
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
          sequelizeJobTagsBulkData.push({
            JobID: parseInt(currentJobID),
            TagID: newTagData.ID,
          });
        });
        await this.models.jobTags.bulkCreate(sequelizeJobTagsBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };

  copyJob = async ({ jobId, title, userId }) => {
    title += ' - Copy';
    const job = await this.models.jobs.findOne({
      where: {
        ID: jobId,
        IsDeleted: false,
      },
    });
    const hiringTeamData = await this.models.jobHiringTeam.findAll({
      where: {
        JobID: jobId,
        IsDeleted: false,
      },
    });
    const tagsData = await this.models.jobTags.findAll({
      where: {
        JobID: jobId,
        IsDeleted: false,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const fetchJob = await this.models.jobs.create(
        {
          CompanyID: job.CompanyID,
          Title: title,
          DepartmentID: job.DepartmentID,
          JobTypeID: job.JobTypeID,
          EmploymentTypeID: job.EmploymentTypeID,
          LocationID: job.LocationID,
          Description: job.Description,
          NumberOfPositions:
            job.NumberOfPositions === '' ? null : job.NumberOfPositions,
          LastDate: job.LastDate,
          MinSalary: job.MinSalary === '' ? null : job.MinSalary,
          MaxSalary: job.MaxSalary === '' ? null : job.MaxSalary,
          CurrencyID: job.CurrencyID,
          ShiftTime: job.ShiftTime,
          MinimumEducationID: job.MinimumEducationID,
          MinimumExperienceID: job.MinimumExperienceID,
          IsResumeRequired: job.IsResumeRequired,
          IsExpectedSalaryRequired: job.IsExpectedSalaryRequired,
          IsNameRequired: job.IsNameRequired,
          IsNameRequired: job.IsNameRequired,
          IsEmailRequired: job.IsEmailRequired,
          IsLinkedInRequired: job.IsLinkedInRequired,
          IsTestRequired: job.IsTestRequired,
          CreatedBy: userId,
          CreatedAt: Date.now(),
          PipelineID: job.PipelineID,
          ScoreCardID: job.ScoreCardID,
          InternalID: job.InternalID,
          SalaryPeriodID: job.SalaryPeriodID,
          PublishStatusID: job.PublishStatusID,
          JobStatusID: job.JobStatusID,
          PageTitle: job.PageTitle,
          URLHandle: job.URLHandle,
          MetaDescription: job.MetaDescription,
        },
        { transaction: t }
      );

      await fetchJob.save({ transaction: t });

      if (hiringTeamData) {
        const sequelizeBulkData = [];
        hiringTeamData.forEach((teamMember) => {
          sequelizeBulkData.push({
            JobID: parseInt(fetchJob.ID),
            UserID: teamMember.UserID,
            TeamID: teamMember.TeamID,
          });
        });
        await this.models.jobHiringTeam.bulkCreate(sequelizeBulkData, {
          transaction: t,
        });
      }
      if (tagsData) {
        const sequelizeJobTagsBulkData = [];
        for await (const tag of tagsData) {
          sequelizeJobTagsBulkData.push({
            JobID: parseInt(fetchJob.ID),
            TagID: parseInt(tag.TagID),
          });
        }
        await this.models.jobTags.bulkCreate(sequelizeJobTagsBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };
  createJob = async (body) => {
    this.jobMapperValidation(body);
    const {
      userId,
      companyId,
      title,
      jobTypeId,
      employmentTypeId,
      locationId,
      scoreCardId,
      internalId,
      departmentId,
      salaryPeriodId,
      currencyId,
      publishStatusId,
      pipelineId,
      jobStatusId,
      description,
      numberOfPositions,
      lastDate,
      minSalary,
      maxSalary,
      shiftTime,
      minimumEducationId,
      minimumExperienceId,
      isResumeRequired,
      isExpectedSalaryRequired,
      isNameRequired,
      isPhoneRequired,
      isEmailRequired,
      isLinkedInRequired,
      isTestRequired,
      isProfilePictureRequired,
      isCoverLetterRequired,
      tags,
      hiringTeamData,
      metaDescription,
      pageTitle,
      urlHandle,
    } = body;
    if (!title) {
      throw new BadRequestError('Job must have a title');
    }
    if (!jobStatusId) {
      throw new BadRequestError('a job status id must be provided');
    }
    if (!companyId) {
      throw new BadRequestError('a company id must be provided');
    }
    const jobExist = await this.models.jobs.findOne({
      where: {
        CompanyID: companyId,
        Title: title,
        IsDeleted: 0,
      },
    });
    if (jobExist) {
      throw new BadRequestError(
        'Job or job draft with same name already exists'
      );
    }

    const companyExists = await this.models.companies.findOne({
      where: {
        ID: companyId,
      },
    });
    if (!companyExists) throw new BadRequestError('Company Does not exist');
    const jobCreatingUser = await this.models.users.findOne({
      attributes: ['ID', 'Name'],
      where: {
        ID: userId,
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
        CompanyID: companyId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const fetchJob = await this.models.jobs.create(
        {
          CompanyID: companyId,
          Title: title,
          DepartmentID: departmentId,
          JobTypeID: jobTypeId,
          EmploymentTypeID: employmentTypeId,
          LocationID: locationId,
          Description: description,
          NumberOfPositions:
            numberOfPositions === '' ? null : numberOfPositions,
          LastDate: lastDate,
          MinSalary: minSalary === '' ? null : minSalary,
          MaxSalary: maxSalary === '' ? null : maxSalary,
          CurrencyID: currencyId,
          ShiftTime: shiftTime,
          MinimumEducationID: minimumEducationId,
          MinimumExperienceID: minimumExperienceId,
          IsResumeRequired: isResumeRequired,
          IsExpectedSalaryRequired: isExpectedSalaryRequired,
          IsNameRequired: isNameRequired,
          IsPhoneRequired: isPhoneRequired,
          IsEmailRequired: isEmailRequired,
          IsLinkedInRequired: isLinkedInRequired,
          IsTestRequired: isTestRequired,
          IsProfilePictureRequired: isProfilePictureRequired,
          IsCoverLetterRequired: isCoverLetterRequired,
          CreatedBy: userId,
          CreatedAt: Date.now(),
          PipelineID: pipelineId,
          ScoreCardID: scoreCardId,
          InternalID: internalId,
          DepartmentID: departmentId,
          SalaryPeriodID: salaryPeriodId,
          PublishStatusID: publishStatusId,
          JobStatusID: jobStatusId,
          PageTitle: pageTitle,
          URLHandle: urlHandle,
          MetaDescription: metaDescription,
        },
        { transaction: t }
      );

      await fetchJob.save({ transaction: t });

      const updateJobObject = {};

      await this.models.userStarJobs.create(
        {
          UserID: userId,
          JobID: parseInt(fetchJob.ID),
          IsStar: true,
          IsDeleted: false,
          CreatedBy: userId,
          CreatedDate: Date.now(),
          ModifiedBy: userId,
          ModifiedDate: Date.now(),
        },
        { transaction: t }
      );
      updateJobObject['NumberOfPositions'] =
        updateJobObject['NumberOfPositions'] === ''
          ? null
          : updateJobObject['NumberOfPositions'];
      updateJobObject['MinSalary'] =
        updateJobObject['MinSalary'] === ''
          ? null
          : updateJobObject['MinSalary'];
      updateJobObject['MaxSalary'] =
        updateJobObject['MaxSalary'] === ''
          ? null
          : updateJobObject['MaxSalary'];
      await this.models.jobs.update(updateJobObject, {
        where: { ID: parseInt(fetchJob.ID) },
        transaction: t,
      });
      const sequelizeBulkData = [];
      const AddedToPositionKeyMapList = [];
      const hiringTeamDataWithEmails = await this.models.users.findAll({
        attributes: ['ID', 'EmailAddress'],
        where: {
          ID: hiringTeamData.userIds,
        },
      });
      hiringTeamDataWithEmails.forEach((user) => {
        AddedToPositionKeyMapList.push({
          UserID: parseInt(user.ID),
          PositionName: title,
          UserName: jobCreatingUser.Name,
          Email: user.EmailAddress,
        });
        sequelizeBulkData.push({
          JobID: parseInt(fetchJob.ID),
          UserID: parseInt(user.ID),
        });
      });
      await this.models.jobHiringTeam.bulkCreate(sequelizeBulkData, {
        transaction: t,
      });

      const sequelizeTeamBulkData = [];
      hiringTeamData.teamIds.forEach((Id) => {
        sequelizeTeamBulkData.push({
          JobID: parseInt(fetchJob.ID),
          TeamID: Id,
        });
      });
      await this.models.jobHiringTeam.bulkCreate(sequelizeTeamBulkData, {
        transaction: t,
      });

      if (tags) {
        const sequelizeJobTagsBulkData = [];
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
            sequelizeJobTagsBulkData.push({
              JobID: parseInt(fetchJob.ID),
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
          sequelizeJobTagsBulkData.push({
            JobID: parseInt(fetchJob.ID),
            TagID: newTagData.ID,
          });
        });
        await this.models.jobTags.bulkCreate(sequelizeJobTagsBulkData, {
          transaction: t,
        });
      }
      const keyMapList = [
        {
          UserID: parseInt(adminUser.ID),
          JobCreated: title,
          Email: adminUser.EmailAddress,
        },
      ];
      await this.createNotification(
        2,
        keyMapList,
        'New Job Created',
        this.notificationRedirectsLinks.Position + fetchJob.ID
      );
      await this.createNotification(
        5,
        AddedToPositionKeyMapList,
        'Added to Position',
        this.notificationRedirectsLinks.Position + fetchJob.ID
      );
    });
    return {
      success: true,
    };
  };

  updateJob = async (requestBody) => {
    const { userId, tags, hiringTeamData, companyId, jobId } = requestBody;
    const updateJobObject = Object.fromEntries(
      Object.entries(requestBody).filter(
        ([key]) =>
          key !== 'tags' && key !== 'hiringTeamData' && key !== 'userId'
      )
    );
    updateJobObject['ModifiedBy'] = userId;
    updateJobObject['ModifiedDate'] = Date.now();
    await this.sequelize.transaction(async (t) => {
      const currentJob = await this.models.jobs.findOne({
        where: {
          ID: jobId,
        },
      });
      updateJobObject['NumberOfPositions'] =
        updateJobObject['NumberOfPositions'] === ''
          ? null
          : updateJobObject['NumberOfPositions'];
      updateJobObject['MinSalary'] =
        updateJobObject['MinSalary'] === ''
          ? null
          : updateJobObject['MinSalary'];
      updateJobObject['MaxSalary'] =
        updateJobObject['MaxSalary'] === ''
          ? null
          : updateJobObject['MaxSalary'];
      const updateJob = await this.models.jobs.update(updateJobObject, {
        where: { ID: jobId },
        transaction: t,
      });
      if (parseInt(currentJob.PipelineID) !== updateJobObject.PipelineID) {
        const newPipelineData = await this.models.pipelines.findOne({
          include: [
            {
              model: this.models.stages,
              attributes: ['ID', 'Name'],
              where: {
                IsDeleted: false,
                Name: 'Missing Stage',
              },
              order: [['StageOrder', 'ASC']],
            },
          ],
          where: {
            ID: updateJobObject.PipelineID,
          },
        });
        await this.models.applications.update(
          {
            ModifiedBy: userId,
            ModifiedDate: Date.now(),
            StageID: newPipelineData.Stages[0].ID,
          },
          {
            where: {
              JobID: jobId,
              IsDeleted: false,
            },
            transaction: t,
          }
        );
      }

      await this.models.jobHiringTeam.destroy(
        {
          where: {
            JobID: jobId,
          },
        },
        {
          transaction: t,
        }
      );
      if (hiringTeamData.userIds.length > 0) {
        const sequelizeBulkData = [];
        hiringTeamData.userIds.forEach((Id) => {
          sequelizeBulkData.push({
            JobID: jobId,
            UserID: Id,
          });
        });
        await this.models.jobHiringTeam.bulkCreate(sequelizeBulkData, {
          transaction: t,
        });
      }
      if (hiringTeamData.teamIds.length > 0) {
        const sequelizeTeamBulkData = [];
        hiringTeamData.teamIds.forEach((Id) => {
          sequelizeTeamBulkData.push({
            JobID: jobId,
            TeamID: Id,
          });
        });
        await this.models.jobHiringTeam.bulkCreate(sequelizeTeamBulkData, {
          transaction: t,
        });
      }

      await this.models.jobTags.destroy(
        {
          where: {
            JobID: jobId,
          },
        },
        {
          transaction: t,
        }
      );

      if (tags) {
        const sequelizeJobTagsBulkData = [];
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
            sequelizeJobTagsBulkData.push({
              JobID: jobId,
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
          sequelizeJobTagsBulkData.push({
            JobID: jobId,
            TagID: newTagData.ID,
          });
        });
        await this.models.jobTags.bulkCreate(sequelizeJobTagsBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };

  deleteJob = async ({ userId, jobId }) => {
    const deletingUser = await this.models.users.findOne({
      attributes: ['ID', 'Name'],
      where: {
        ID: userId,
      },
    });
    const keyMapList = [];
    const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(jobId);
    const job = await this.models.jobs.findOne({
      attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
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
    for (const member of hiringTeamMembersData) {
      keyMapList.push({
        UserID: member.UserID,
        Email: member.Email,
        PositionName: job.Title,
        UserName: deletingUser.Name,
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
        PositionName: job.Title,
        UserName: deletingUser.Name,
      });
    }
    const updateJobObject = { IsDeleted: true, IsActive: false };
    await this.models.jobs.update(updateJobObject, { where: { ID: jobId } });
    await this.createNotification(5, keyMapList, 'Position Deleted');
    return {
      success: true,
    };
  };

  fetchPipelineStages = async ({ jobId }) => {
    const results = await this.models.jobs.findOne({
      attributes: ['ID', 'Title'],
      include: [
        {
          model: this.models.pipelines,
          attributes: ['ID', 'Name', 'PipelineTypeID'],
          include: [
            {
              model: this.models.stages,
              attributes: ['ID', 'Name'],
              where: {
                IsDeleted: false,
                Name: {
                  [Op.ne]: 'Missing Stage',
                },
              },
              order: [['StageOrder', 'ASC']],
            },
          ],
        },
      ],
      where: {
        ID: parseInt(jobId),
      },
    });
    return {
      results,
      success: true,
    };
  };

  addUpdateUserStarJobCandidate = async ({
    jobID,
    applicationID,
    isStar,
    userId,
  }) => {
    // Step 1: Check if a record exists
    let isFound = await this.models.usersJobsStarCandidates.findOne({
      attributes: ['ID'],
      where: {
        UserID: userId,
        JobID: jobID,
        ApplicationID: applicationID,
      },
    });

    isFound = isFound ? isFound.ID : null;

    // Step 2: Insert or update based on the existence of the record
    if (!isFound) {
      // Insert the record
      await this.models.usersJobsStarCandidates.create({
        UserID: userId,
        JobID: jobID,
        ApplicationID: applicationID,
        IsStar: isStar,
        IsDeleted: false,
        CreatedBy: userId,
        CreatedDate: Date.now(),
        ModifiedBy: userId,
        ModifiedDate: Date.now(),
      });
    } else {
      // Update the existing record
      await this.models.usersJobsStarCandidates.update(
        {
          IsStar: isStar,
          IsDeleted: false,
        },
        {
          where: {
            UserID: userId,
            JobID: jobID,
            ApplicationID: applicationID,
          },
        }
      );
    }
    return {
      success: true,
    };
  };
  addUpdateUserStarJob = async ({ jobID, isStar, userId }) => {
    // Step 1: Check if a record exists
    let isFound = await this.models.userStarJobs.findOne({
      attributes: ['ID'],
      where: {
        UserID: userId,
        JobID: jobID,
      },
    });

    isFound = isFound ? isFound.ID : null;

    // Step 2: Insert or update based on the existence of the record
    if (!isFound) {
      // Insert the record
      await this.models.userStarJobs.create({
        UserID: userId,
        JobID: jobID,
        IsStar: isStar,
        IsDeleted: false,
        CreatedBy: userId,
        CreatedDate: Date.now(),
        ModifiedBy: userId,
        ModifiedDate: Date.now(),
      });
    } else {
      // Update the existing record
      await this.models.userStarJobs.update(
        {
          IsStar: isStar,
          IsDeleted: false,
        },
        {
          where: {
            UserID: userId,
            JobID: jobID,
          },
        }
      );
    }
    return {
      success: true,
    };
  };
  updateJobStatus = async ({ userId, jobStatusID, companyId, jobId }) => {
    const keyMapList = [];
    const statusChangingUser = await this.models.users.findOne({
      attrbitues: ['Name', 'ID'],
      where: {
        ID: userId,
      },
    });
    const newJobStatus = await this.models.jobStatuses.findOne({
      attributes: ['Title'],
      where: {
        ID: jobStatusID,
      },
    });
    const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(jobId);
    const job = await this.models.jobs.findOne({
      attributes: ['ID', 'CreatedBy', 'Title', 'Description'],
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
    for (const member of hiringTeamMembersData) {
      keyMapList.push({
        UserID: member.UserID,
        Email: member.Email,
        PositionName: job.Title,
        JobStatus: newJobStatus.Title,
        UserName: statusChangingUser.Name,
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
        PositionName: job.Title,
        JobStatus: newJobStatus.Title,
        UserName: statusChangingUser.Name,
      });
    }
    await this.sequelize.transaction(async (t) => {
      await this.models.jobs.update(
        {
          JobStatusID: jobStatusID,
        },
        {
          where: {
            ID: jobId,
            CompanyID: companyId,
          },
          transaction: t
        }
      );
      await this.createNotification(
        5,
        keyMapList,
        'Position Status Changed',
        this.notificationRedirectsLinks.Position + jobId
      );
    })
    return {
      success: true,
    };
  };
  deleteJobCandidate = async ({ jobId, applicantId, userId, companyId }) => {
    // Update the existing record
    await this.sequelize.transaction(async (t) => {
      await this.models.applications.update(
        { IsDeleted: 1, ModifiedBy: userId, ModifiedDate: Date.now() },
        {
          where: {
            jobid: jobId,
            ApplicantID: applicantId,
          },
          include: [
            {
              model: this.models.jobs,
              where: {
                CompanyID: companyId,
              },
            },
          ],
          transaction: t,
        }
      );
    });
    return {
      success: true,
    };
  };

  fetchJobHiringTeam = async ({ jobId }) => {
    const hiringTeamMembersData = await this.getAllUsersFromHiringTeam(jobId);
    return {
      hiringTeamMembersData,
      success: true,
    };
  };

}

module.exports = JobsService;

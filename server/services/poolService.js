const { Op } = require('sequelize');
const { BadRequestError } = require('../utils/errorTypes');
const BaseService = require('./baseService');

class PoolService extends BaseService {
  constructor(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack) {
    super(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack);
  }
  createPool = async ({
    poolName,
    companyId,
    categoryId,
    pipelineId,
    tags,
    userId,
  }) => {
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
    const poolData = await this.models.pools.findOne({
      where: {
        Name: poolName,
        CompanyID: companyId,
      },
    });
    if (poolData) {
      throw new BadRequestError('Pool with this name already exists');
    }
    await this.sequelize.transaction(async (t) => {
      const pool = await this.models.pools.create(
        {
          Name: poolName,
          CreatedBy: userId,
          CreatedDate: Date.now(),
          PipelineID: pipelineId,
          CategoryID: categoryId,
          CompanyID: companyId,
        },
        { transaction: t }
      );

      if (tags) {
        const sequelizePoolTagsBulkData = [];
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
            sequelizePoolTagsBulkData.push({
              PoolID: parseInt(pool.ID),
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
          sequelizePoolTagsBulkData.push({
            PoolID: parseInt(pool.ID),
            TagID: newTagData.ID,
          });
        });
        await this.models.poolTags.bulkCreate(sequelizePoolTagsBulkData, {
          transaction: t,
        });
      }
      const keyMapList = [
        {
          UserID: parseInt(adminUser.ID),
          PoolName: poolName,
          Email: adminUser.EmailAddress,
        },
      ];
      await this.createNotification(
        2,
        keyMapList,
        'New Pool Created',
        this.notificationRedirectsLinks.Pool + pool.ID
      );
    });
    return {
      success: true,
    };
  };
  copyPool = async ({ poolName, poolId, companyId, userId }) => {
    poolName += ' - Copy';
    const poolExists = await this.models.pools.findOne({
      where: {
        Name: poolName,
      },
    });
    if (poolExists) {
      throw new BadRequestError('Pool Copy already exists');
    }
    const poolData = await this.models.pools.findOne({
      where: {
        ID: poolId,
        CompanyID: companyId,
      },
    });
    const poolTagsData = await this.models.poolTags.findAll({
      where: {
        PoolID: poolId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const pool = await this.models.pools.create(
        {
          Name: poolName,
          CreatedBy: userId,
          CreatedDate: Date.now(),
          PipelineID: parseInt(poolData.PipelineID),
          CategoryID: parseInt(poolData.CategoryID),
          CompanyID: companyId,
        },
        { transaction: t }
      );
      if (poolTagsData) {
        const sequelizePoolTagsBulkData = [];
        for await (const tag of poolTagsData) {
          sequelizePoolTagsBulkData.push({
            PoolID: parseInt(pool.ID),
            TagID: parseInt(tag.TagID),
          });
        }
        await this.models.poolTags.bulkCreate(sequelizePoolTagsBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };
  updatePool = async ({
    poolId,
    poolName,
    categoryId,
    pipelineId,
    companyId,
    tags,
    userId,
  }) => {
    await this.sequelize.transaction(async (t) => {
      const updatePoolObject = {
        Name: poolName,
        CategoryID: categoryId,
        PipelineID: pipelineId,
        CompanyID: companyId,
      };
      await this.models.pools.update(updatePoolObject, {
        where: { ID: poolId },
        transaction: t,
      });
      if (tags) {
        await this.models.poolTags.destroy(
          {
            where: {
              PoolID: poolId,
            },
          },
          {
            transaction: t,
          }
        );
        const sequelizePoolTagsBulkData = [];
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
              CompanyID: companyId,
              Name: tag,
              CreatedBy: userId,
            });
          } else {
            sequelizePoolTagsBulkData.push({
              PoolID: poolId,
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
          sequelizePoolTagsBulkData.push({
            PoolID: poolId,
            TagID: newTagData.ID,
          });
        });
        await this.models.poolTags.bulkCreate(sequelizePoolTagsBulkData, {
          transaction: t,
        });
      }
    });
    return {
      success: true,
    };
  };
  fetchAllPools = async ({ companyId }) => {
    const pools = await this.models.pools.findAll({
      include: [
        {
          model: this.models.categories,
        },
      ],
      where: {
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      pools,
      success: true,
    };
  };
  fetchPool = async ({ companyId, poolId }) => {
    const pool = await this.models.pools.findOne({
      include: [
        {
          model: this.models.categories,
        },
      ],
      where: {
        ID: poolId,
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      pool,
      success: true,
    };
  };
  fetchPaginatedPools = async ({
    companyId,
    userId,
    offset,
    isAdmin,
    isGlobal,
    limit,
    filters,
  }) => {
    let categoryWhere = {};
    let nameWhere = {};
    let restrictWhere = {};
    if (filters.name) {
      nameWhere['Name'] = {
        [Op.like]: `%${filters.name}%`,
      };
    }
    if (filters.categoryId) {
      categoryWhere = {
        CategoryID: filters.categoryId,
      };
    }
    if (!isAdmin && !isGlobal) {
      restrictWhere = {
        CreatedBy: userId,
      };
    }
    const candidatePoolsCounts = [];
    let poolWhereClause = {
      companyID: companyId,
      IsDeleted: false,
    };
    poolWhereClause = {
      ...poolWhereClause,
      ...categoryWhere,
      ...nameWhere,
      ...restrictWhere,
    };
    const pools = await this.models.pools.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      include: [
        {
          required: false,
          model: this.models.candidatePools,
          where: {
            IsDeleted: false,
          },
        },
        {
          required: false,
          attributes: ['Name'],
          model: this.models.users,
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.categories,
        },
        {
          required: false,
          model: this.models.pipelines,
          where: {
            IsDeleted: false,
            CompanyID: companyId,
          },
        },
      ],
      where: poolWhereClause,
      order: [['ID', 'DESC']],
    });
    for (const row of pools.rows) {
      candidatePoolsCounts.push({
        poolId: row.ID,
        candidatePoolsCount: row.CandidatePools.length,
      });
    }
    return {
      candidatePoolsCounts,
      pools,
      success: true,
    };
  };
  deletePool = async ({ poolId }) => {
    const poolData = await this.models.pools.findOne({
      where: {
        ID: parseInt(poolId),
      },
    });
    if (!poolData) {
      return new BadRequestError('pool does not exist');
    }
    await this.models.pools.update(
      {
        IsDeleted: true,
      },
      {
        where: {
          ID: parseInt(poolId),
        },
      }
    );
    return {
      success: true,
    };
  };

  deleteApplicantFromPool = async ({
    poolId,
    applicantId,
    companyId,
    userId,
  }) => {
    const poolData = await this.models.pools.findOne({
      where: {
        ID: parseInt(poolId),
      },
    });

    if (!poolData) {
      return new BadRequestError('pool does not exist');
    }
    const applicantData = await this.models.applicants.findOne({
      where: {
        ID: parseInt(applicantId),
        CompanyID: parseInt(companyId),
      },
    });
    if (!applicantData) {
      return new BadRequestError('applicant does not exist');
    }
    await this.models.candidatePools.update(
      {
        IsDeleted: true,
        ModifiedBy: parseInt(userId),
      },
      {
        where: {
          PoolID: parseInt(poolId),
          ApplicantID: parseInt(applicantId),
        },
      }
    );
    return {
      success: true,
    };
  };

  fetchPipelineStages = async ({ poolId }) => {
    const results = await this.models.pools.findOne({
      attributes: ['ID', 'Name'],
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
        ID: parseInt(poolId),
      },
    });
    return {
      results,
      success: true,
    };
  };
}

module.exports = PoolService;

const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Jobs',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['CompanyID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['DepartmentID']: {
      type: Sequelize.BIGINT,
    },
    ['Title']: {
      type: Sequelize.STRING(250),
    },
    ['InternalID']: {
      type: Sequelize.STRING(50),
    },
    ['JobTypeID']: {
      type: Sequelize.TINYINT,
    },
    ['EmploymentTypeID']: {
      type: Sequelize.TINYINT,
    },
    ['LocationID']: {
      type: Sequelize.BIGINT(50),
    },
    ['Description']: {
      type: Sequelize.STRING(max),
    },
    ['NumberOfPositions']: {
      type: Sequelize.SMALLINT,
    },
    ['LastDate']: {
      type: MSSQL_DATE,
    },
    ['ShiftTime']: {
      type: Sequelize.TINYINT,
    },
    ['MinimumEducationID']: {
      type: Sequelize.TINYINT,
    },
    ['MinimumExperienceID']: {
      type: Sequelize.TINYINT,
    },
    ['MinSalary']: {
      type: Sequelize.DECIMAL,
    },
    ['MaxSalary']: {
      type: Sequelize.DECIMAL,
    },
    ['SalaryPeriodID']: {
      type: Sequelize.TINYINT,
    },
    ['CurrencyID']: {
      type: Sequelize.SMALLINT,
    },
    ['IsResumeRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsExpectedSalaryRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsNameRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsPhoneRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsEmailRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsLinkedInRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsTestRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsProfilePictureRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsCoverLetterRequired']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },

    ['PublishStatusID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      defaultValue: 1,
    },
    ['PipelineID']: {
      type: Sequelize.BIGINT,
    },
    ['ScoreCardID']: {
      type: Sequelize.BIGINT,
    },

    ['JobStatusID']: {
      type: Sequelize.TINYINT,
    },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedBy']: {
      type: Sequelize.BIGINT,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['IsActive']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['PageTitle']: {
      type: Sequelize.STRING(70),
    },
    ['MetaDescription']: {
      type: Sequelize.STRING(500),
    },
    ['URLHandle']: {
      type: Sequelize.STRING(500),
    },
  };

  return sequelize.define('Jobs', definition, options);
};

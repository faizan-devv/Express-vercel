const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Meetings',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['EventID']: {
      type: Sequelize.STRING(250),
    },
    ['CompanyLocationID']: {
      type: Sequelize.BIGINT,
    },
    ['ApplicantID']: {
      type: Sequelize.BIGINT,
    },
    ['TimeZoneID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
    },
    ['MeetingStatusID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
    },
    ['MeetingOptionID']: {
      type: Sequelize.TINYINT,
    },
    ['MeetingTypeID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['DurationID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    ['Description']: {
      allowNull: false,
      type: Sequelize.STRING(max),
    },
    ['MeetingDateTime']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['MeetingLink']: {
      type: Sequelize.STRING(500),
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
      type: Sequelize.INTEGER,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('Meetings', definition, options);
};

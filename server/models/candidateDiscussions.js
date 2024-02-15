const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateDiscussions',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['ApplicantID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['Message']: {
      allowNull: false,
      type: Sequelize.STRING(200),
    },
    ['MessageWithMentions']: {
      allowNull: false,
      type: Sequelize.STRING(200),
    },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['ReplyToDiscussionID']: { 
      type: Sequelize.BIGINT, 
    },
  };

  return sequelize.define('CandidateDiscussions', definition, options);
};

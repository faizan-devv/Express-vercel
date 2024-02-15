const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'DiscussionMentionedUsers',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['UserID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CandidateDiscussionsID']: {
        allowNull: false,
        type: Sequelize.BIGINT,
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
        allowNull: true,
        type: Sequelize.BIGINT,
      },
      ['ModifiedDate']: {
        allowNull: true,
        type: MSSQL_DATE,
      },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
     
  };

  return sequelize.define('DiscussionMentionedUsers', definition, options);
};

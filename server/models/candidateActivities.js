const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateActivities',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Message']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['ApplicantID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['PoolFromID']: {
      type: Sequelize.BIGINT,
    },
    ['PoolToID']: {
      type: Sequelize.BIGINT,
    },
    ['JobFromID']: {
      type: Sequelize.BIGINT,
    },
    ['JobToID']: {
      type: Sequelize.BIGINT,
    },
    ['StageFromID']: {
      type: Sequelize.BIGINT,
    },
    ['StageToID']: {
      type: Sequelize.BIGINT,
    },
    ['ApplicantID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['OfferStatusID']: {
      type: Sequelize.TINYINT,
    },
    ['CreatedBy']: {
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('CandidateActivities', definition, options);
};

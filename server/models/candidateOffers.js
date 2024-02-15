const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateOffers',
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
    ['OfferStatusID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['OfferComment']: {
      type: Sequelize.STRING(250),
    },
    ['CandidateDocumentID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['OfferHash']: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    ['Subject']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['Description']: {
      allowNull: false,
      type: Sequelize.STRING(max),
    },
    ['OfferExpirationDate']: {
      allowNull: false,
      type: MSSQL_DATE,
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
    ['IsCompleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('CandidateOffers', definition, options);
};

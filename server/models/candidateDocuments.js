const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateDocuments',
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
    ['DocumentTypeID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    ['Path']: {
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    ['CreatedBy']: {
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
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('CandidateDocuments', definition, options);
};

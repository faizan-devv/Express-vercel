const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Applications',
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
    ['JobID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['StageID']: {
      type: Sequelize.BIGINT,
    },
    ['ExpectedSalary']: {
      type: Sequelize.FLOAT,
    },
    ['CoverLetter']: {
      type: Sequelize.STRING(1000),
    },
    ['ApplicantStatusID']: {
      type: Sequelize.TINYINT,
    },
    ['Score']: {
      type: Sequelize.DOUBLE,
    },
    ['RelevancyScore']: {
      type: Sequelize.DOUBLE,
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

  return sequelize.define('Applications', definition, options);
};

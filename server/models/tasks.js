const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Tasks',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['ApplicantID']: {
      type: Sequelize.BIGINT,
    },
    ['JobID']:{
      type: Sequelize.BIGINT,
    },
    ['TaskStatusID']: {
      type: Sequelize.TINYINT,
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    ['DueDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['Description']: {
      type: Sequelize.STRING(max),
    },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.INTEGER,
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
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('Tasks', definition, options);
};

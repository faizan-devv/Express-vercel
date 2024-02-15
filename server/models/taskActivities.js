const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: false,
    tableName: 'TaskActivities',
  };

  const definition = {
    ['ID']: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ['TaskID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['Description']: {
      type: Sequelize.STRING(500),
    },
    ['CreatedBy']: {
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull:false,
      type: MSSQL_DATE,
    },
    ['IsCompleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
  };

  return sequelize.define('TaskActivities', definition, options);
};

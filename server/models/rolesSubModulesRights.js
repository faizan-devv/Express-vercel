const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'RoleSubModuleRights',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['RoleID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['SubModuleID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['RightsID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
    },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
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

  return sequelize.define('RoleSubModuleRights', definition, options);
};

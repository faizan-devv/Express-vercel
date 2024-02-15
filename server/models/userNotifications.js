const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'UserNotifications',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['UserID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['NotificationCategoryID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['NotificationURL']: {
      type: Sequelize.STRING(150),
    },
    ['Message']: {
      allowNull: false,
      type: Sequelize.STRING(200),
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['IsRead']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('UserNotifications', definition, options);
};

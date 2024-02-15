const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'ThirdPartyAPITokens',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['UserID']: {
      type: Sequelize.BIGINT,
    },
    ['ThirdPartyApiID']: {
      type: Sequelize.BIGINT,
    },
    ['IntegrationID']: {
      type: Sequelize.STRING(150),
    },
    ['Token']: {
      allowNull: false,
      type: Sequelize.STRING(5000),
    },
    ['RefreshToken']: {
      type: Sequelize.STRING(5000),
    },
    ['TokenExpiryDate']: {
      type: MSSQL_DATE,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('ThirdPartyAPITokens', definition, options);
};

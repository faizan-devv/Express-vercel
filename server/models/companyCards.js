const Sequelize = require('sequelize');
module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'CompanyCards',
  };
  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['FingerPrint']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['CompanyID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CardTypeID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['Brand']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['LastFour']: {
      type: Sequelize.STRING(4),
    },
    ['ExpiryMonth']: {
      type: Sequelize.STRING(250),
    },
    ['ExpiryYear']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };
  return sequelize.define('CompanyCards', definition, options);
};

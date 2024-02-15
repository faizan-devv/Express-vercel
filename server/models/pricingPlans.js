const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'PricingPlans',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    ['Description']: {
      type: Sequelize.STRING(500),
    },
    ['StripePlanID']: {
      type: Sequelize.STRING(100),
    },
    ['Cost']: {
      type: Sequelize.INTEGER,
    },
    ['CurrencyID']: {
      type: Sequelize.INTEGER,
    },
    ['RecurrenceID']: {
      type: Sequelize.TINYINT,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('PricingPlans', definition, options);
};

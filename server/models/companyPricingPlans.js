const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'CompanyPricingPlans',
  };
  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['PricingPlanID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CompanyID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['StripeSubscriptionID']: {
      type: Sequelize.STRING(250),
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };
  return sequelize.define('CompanyPricingPlans', definition, options);
};

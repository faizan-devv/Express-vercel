const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'BenefitsPlans',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['PricingPlansID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['BenefitTitle']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['BenefitValue']: {
      type: Sequelize.STRING(250),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('BenefitsPlans', definition, options);
};

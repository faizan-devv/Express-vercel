const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'SalaryPeriods',
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
      type: Sequelize.STRING(50),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('SalaryPeriods', definition, options);
};

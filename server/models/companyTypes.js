const Sequelize = require('sequelize');
module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'CompanyTypes',
  };
  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };
  return sequelize.define('CompanyTypes', definition, options);
};

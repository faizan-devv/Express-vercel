const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'States',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ['CountryID']: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('States', definition, options);
};

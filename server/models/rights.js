const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'Rights',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
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

  return sequelize.define('Rights', definition, options);
};

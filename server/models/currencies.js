const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'Currencies',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['Code']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['Symbol']: {
      allowNull: false,
      type: Sequelize.STRING(5),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('Currencies', definition, options);
};

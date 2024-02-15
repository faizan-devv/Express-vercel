const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'Notifications',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['NotificationCategoryID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(200),
    },
    ['Description']: {
      allowNull: false,
      type: Sequelize.STRING(5000),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('Notifications', definition, options);
};

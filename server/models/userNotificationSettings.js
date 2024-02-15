const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'UserNotificationSettings',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['UserID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['NotificationID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
    },
    ['SendEmailNotification']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['SendAlertNotification']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['SendSlackNotification']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('UserNotificationSettings', definition, options);
};

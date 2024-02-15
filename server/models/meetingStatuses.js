const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'MeetingStatuses',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('MeetingStatuses', definition, options);
};

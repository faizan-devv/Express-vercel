const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'TimeZones',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['DisplayName']: {
      type: Sequelize.STRING(250),
    },
    ['HasDst']: {
      type: Sequelize.BOOLEAN,
    },
    ['UtcOffset']: {
      type: Sequelize.INTEGER,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultvalue: 0,
    },
    ['StandardName']: {
      type: Sequelize.STRING(250),
    },
    ['GoogleCalendarName']: {
      type: Sequelize.STRING(100),
    },
  };

  return sequelize.define('TimeZones', definition, options);
};

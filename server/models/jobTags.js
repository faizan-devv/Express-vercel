const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'JobTags',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['JobID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['TagID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('JobTags', definition, options);
};

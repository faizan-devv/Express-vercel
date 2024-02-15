const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'TaskAssignees',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['TaskID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['UserID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
  };

  return sequelize.define('TaskAssignees', definition, options);
};

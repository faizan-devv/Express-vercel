const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'JobHiringTeam',
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
    ['UserID']: { 
      type: Sequelize.BIGINT,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['RoleID']: { 
      type: Sequelize.BIGINT,
    },
    ['TeamID']: { 
      type: Sequelize.BIGINT,
    },
    
  };

  return sequelize.define('JobHiringTeam', definition, options);
};

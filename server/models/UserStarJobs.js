const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'UserStarJobs',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['UserID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },

    ['JobID']: {
        allowNull: false,
        type: Sequelize.BIGINT,
      }, 
    ['IsStar']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    }, 
    ['IsDeleted']: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
      },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedBy']: {
      type: Sequelize.BIGINT,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    
  };

  return sequelize.define('UserStarJobs', definition, options);
};

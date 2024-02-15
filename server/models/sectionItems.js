const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'SectionItems',
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
      type: Sequelize.STRING(100),
    },
    ['SectionID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['IsComment']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['CreatedBy']: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['ModifiedBy']: {
      type: Sequelize.BIGINT,
    },
  };

  return sequelize.define('SectionItems', definition, options);
};

const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CompanyLocations',
  };
  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ['CompanyID']: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    ['AddressLine1']: {
      type: Sequelize.STRING(150),
    },
    ['AddressLine2']: {
      type: Sequelize.STRING(150),
    },
    ['Phone']: {
      type: Sequelize.STRING(15),
    },
    ['Zip']: {
      type: Sequelize.STRING(10),
    },
    ['CountryID']: {
      type: Sequelize.INTEGER,
    },
    ['StateID']: {
      type: Sequelize.INTEGER,
    },
    ['CityID']: {
      type: Sequelize.INTEGER,
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
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsPrimary']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('CompanyLocations', definition, options);
};

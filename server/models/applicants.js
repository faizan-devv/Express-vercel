const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Applicants',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['CompanyID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['FullName']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['GenderID']: {
      type: Sequelize.TINYINT,
    },
    ['DateOfBirth']: {
      type: MSSQL_DATE,
    },
    ['Email']: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    ['PhoneNumber']: {
      type: Sequelize.STRING(17),
    },
    ['IsVerified']: {
      type: Sequelize.BOOLEAN,
      default: 0,
    },
    ['OTP']: {
      type: Sequelize.STRING(10),
    },
    ['OTPExpiry']: {
      type: MSSQL_DATE,
    },
    ['LinkedInProfile']: {
      type: Sequelize.STRING(200),
    },
    ['AddressLine1']: {
      type: Sequelize.STRING(50),
    },
    ['AddressLine2']: {
      type: Sequelize.STRING(50),
    },
    ['CountryID']: {
      type: Sequelize.INTEGER,
    },
    ['CityID']: {
      type: Sequelize.INTEGER,
    },
    ['StateID']: {
      type: Sequelize.INTEGER,
    },
    ['ZipCode']: {
      type: Sequelize.STRING(10),
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['CreatedBy']: {
      type: Sequelize.BIGINT,
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedBy']: {
      type: Sequelize.INTEGER,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['ExpectedSalary']: {
      type: Sequelize.FLOAT,
    }, 
  };

  return sequelize.define('Applicants', definition, options);
};

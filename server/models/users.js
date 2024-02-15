const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Users',
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
    ['RoleID']: {
      type: Sequelize.INTEGER,
    },
    ['Name']: {
      type: Sequelize.STRING(100),
    },
    ['EmailAddress']: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    ['PasswordHash']: {
      type: Sequelize.STRING(255),
    },
    ['PhoneNumber']: {
      type: Sequelize.STRING(50),
    },
    ['VerificationCode']: {
      type: Sequelize.STRING(6),
    },
    ['ExpirationDate']: {
      type: MSSQL_DATE,
    },
    ['IsVerified']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['IsSignatureEnabled']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['PictureURL']: {
      type: Sequelize.STRING(250),
    },
    ['Signatures']: {
      type: Sequelize.STRING(max),
    },
    ['PasswordResetToken']: {
      type: Sequelize.STRING(255),
    },
    ['PasswordResetExpirationDate']: {
      type: MSSQL_DATE,
    },
    ['InvitedUserID']: {
      type: Sequelize.BIGINT,
    },
    ['InvitationDate']: {
      type: MSSQL_DATE,
    },
    ['InvitationHash']: {
      type: Sequelize.STRING(255),
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
    ['IsActive']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
      allowNull: false,
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
  };

  return sequelize.define('Users', definition, options);
};

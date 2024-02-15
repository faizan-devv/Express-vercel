const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');
const { max } = require('underscore');
module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CompanyPaymentHistory',
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
    ['SessionID']: {
      type: Sequelize.STRING(500),
    },
    ['NextPayment']: {
      type: MSSQL_DATE,
    },
    ['StripeInvoiceID']: {
      type: Sequelize.STRING(500),
    },
    ['BillingReason']: {
      type: Sequelize.STRING(150),
    },
    ['Currency']: {
      type: Sequelize.STRING(50),
    },
    ['Plan']: {
      type: Sequelize.STRING(150),
    },
    ['Amount']: {
      type: Sequelize.STRING(150),
    },
    ['FilePath']: {
      type: Sequelize.STRING(max),
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['IsDeleted']: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };
  return sequelize.define('CompanyPaymentHistory', definition, options);
};

const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'FeedBackQuestionsAnswers',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['QuestionID']: {
      type: Sequelize.TINYINT,
    },
    ['Answer']: {
      type: Sequelize.STRING(250),
    },
    ['CompanyPricingPlansID']: {
      type: Sequelize.BIGINT,
    },
    ['CompanyID']: {
      type: Sequelize.BIGINT,
    },
    ['CreatedBy']: {
      type: Sequelize.BIGINT,
    },
    ['CreatedDatetime']: {
      type: MSSQL_DATE,
    },
  };

  return sequelize.define('FeedBackQuestionsAnswers', definition, options);
};

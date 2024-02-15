const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'FeedBackQuestions',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Question']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['FeedBackQuestionTypeID']: {
      type: Sequelize.TINYINT,
    },
    ['ParentFeedBackQuestionID']: {
      type: Sequelize.TINYINT,
    },
  };

  return sequelize.define('FeedBackQuestions', definition, options);
};

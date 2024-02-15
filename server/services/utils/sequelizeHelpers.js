const {literal} = require('sequelize');

/**
 * @function getDateTimeConversionLiteral
 * @param {string} columnName - Column name of the table.
 * @param {string} columnAlias - Column alias user want to get.
 * @returns {array} - Returns an array containing date time conversion literal.
 * @description
 * Gets the table column name and returns an array containing date time conversion literal.
 */
const getDateTimeConversionLiteral = (columnName, columnAlias) => {
  return [literal(`convert(varchar, ${columnName}, 22)`), columnAlias];
};

/**
 * @function getDateConversionLiteral
 * @param {string} columnName - Column name of the table.
 * @param {string} columnAlias - Column alias user want to get.
 * @returns {array} - Returns an array containing date conversion literal.
 * @description
 * Gets the table column name and returns an array containing date conversion literal.
 */
const getDateConversionLiteral = (columnName, columnAlias) => {
  return [literal(`convert(varchar, ${columnName}, 101)`), columnAlias];
};

/**
 * @function getTimeConversionLiteral
 * @param {string} columnName - Column name of the table.
 * @param {string} columnAlias - Column alias user want to get.
 * @returns {array} - Returns an array containing time conversion literal.
 * @description
 * Gets the table column name and returns an array containing time conversion literal.
 */
const getTimeConversionLiteral = (columnName, columnAlias) => {
  return [literal(`convert(varchar, ${columnName}, 100)`), columnAlias];
};

module.exports = {
  getDateTimeConversionLiteral,
  getDateConversionLiteral,
  getTimeConversionLiteral,
};

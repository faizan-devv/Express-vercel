const Sequelize = require('sequelize');

const MSSQL_DATE = Object.create(Sequelize.DataTypes.DATE);

MSSQL_DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

module.exports = {
  MSSQL_DATE,
};

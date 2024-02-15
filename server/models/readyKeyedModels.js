/**
 * @function readyKeyedModels
 * @param {string} key
 * @param sequelize
 * @returns {*}
 */
function readyKeyedModels(key, sequelize) {
  const factory = require('./');
  return factory(sequelize);
}

module.exports = readyKeyedModels;

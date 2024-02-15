const logger = require('./logger');
const {getDynamicDbKeys} = require('../utils/dynamicBootHelpers');

/**
 * @function authenticateSequelize
 * @param {StartupContext} ctx - A startup context.
 * @returns {Promise.<StartupContext>}
 * @description
 * Performs authentication for sequelize instances in configuration.
 */
function authenticateSequelize(ctx) {
  logger.info('Starting sequelize authentication process.');
  logger.profile('sequelize-authenticate');

  const authSequelize = tuple => {
    logger.info(`Attempting authentication for database [${tuple.key}].`);
    return tuple.instance.authenticate().then(() => {
      logger.info(`Authentication successful for database [${tuple.key}].`);
      return tuple;
    });
  };

  const authPromises = getDynamicDbKeys(ctx.config.databases)
    .map(dbKey => ({key: dbKey, instance: ctx.config.databases[dbKey]}))
    .map(authSequelize);

  return Promise.all(authPromises).then(() => {
    logger.info('Sequelize authentication process complete.');
    logger.profile('sequelize-authenticate');
    return ctx;
  });
}

module.exports = authenticateSequelize;

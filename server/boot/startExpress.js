const logger = require('../boot/logger');
const { createTerminus } = require('@godaddy/terminus');
const {
  cleanupDatabases,
  registerServerForShutdown,
} = require('../utils/gracefulCrash');

/**
 * @function startExpress
 * @param {StartupContext} ctx - A startup context.
 * @returns {Promise.<StartupContext>}
 * @description
 * Starts the express web server.
 */
function startExpress(ctx) {
  return new Promise((resolve) => {
    logger.info('Starting express web server.');
    const server = ctx.expressApp.listen(ctx.config.http.port, () => {
      logger.info('Express web server started.');
      resolve(ctx);
    });

    registerServerForShutdown(server);

    const onSignal = cleanupDatabases(ctx.config.databases);

    createTerminus(server, {
      timeout: Infinity,
      signals: ['SIGTERM', 'SIGINT'],
      onSignal,
      onShutdown: () => {
        logger.info('Server shutdown complete.');
      },
      logger: (message, err) => {
        logger.error(message);
        logger.error(err.stack);
      },
    });
  });
}

module.exports = startExpress;

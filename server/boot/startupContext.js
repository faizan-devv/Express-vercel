const logger = require('../boot/logger');

/**
 * A context object to be used during server boot.
 * @typedef {Object} StartupContext
 * @property {Map} models - A map containing the Sequelize models using division as the key.
 * @property {Map} services - A map containing the services using division as the key.
 * @property {function} setConfig - A function to store the config in the context object.
 * @property {function} setModels - A function to store the models in the context object.
 * @property {function} setServices - A function to store the services in the context object.
 * @property {function} setSecurity - A function to store the security in the context object.
 * @property {function} setExpress - A function to store the express app in the context object.
 * @property {function} readyLogging - A function to ready the logger in the context object.
 * @property {function} logStarting - A function to log that the boot process is starting.
 * @property {function} logStarted - A function to log that the boot process has started.
 * @property {function} logStartError - A function to log that an error occurred in the boot process.
 */

/**
 * @function StartupContext
 * @returns {StartupContext} The context object.
 * @description
 * Create the StartupContext object.
 */
function StartupContext() {
  const ctx = {
    models: new Map(),
    services: new Map(),
  };

  /**
   * @function setConfig
   * @param {object} config - A configuration object.
   * @returns {StartupContext} The context object.
   * @description
   * Captures the configuration object.
   */
  ctx.setConfig = (config) => {
    ctx.config = config;
    return ctx;
  };

  /**
   * @function setModels
   * @param {string} key - The key for the models.
   * @param {object} models - Sequelize models.
   * @returns {StartupContext} The context object.
   * @description
   * Captures the models for a given database key.
   */
  ctx.setModels = (key, models) => {
    ctx.models.set(key, models);
    return ctx;
  };

  /**
   * @function setServices
   * @param {string} key - The key for the services.
   * @param {object} services - A hash of service instances.
   * @returns {StartupContext} The context object.
   * @description
   * Captures services for a given key.
   */
  ctx.setServices = (key, services) => {
    ctx.services.set(key, services);
    return ctx;
  };

  /**
   * @function setSecurity
   * @param {object} security - A security object.
   * @returns {StartupContext} The context object.
   * @description
   * Captures the security object for the application.
   */
  ctx.setSecurity = (security) => {
    ctx.security = security;
    return ctx;
  };

  /**
   * @function setExpress
   * @param {object} app - An express app instance.
   * @returns {StartupContext} The context object.
   * @description
   * Captures the express app instance.
   */
  ctx.setExpress = (app) => {
    ctx.expressApp = app;
    return ctx;
  };

  /**
   * @function readyLogging
   * @returns {StartupContext} The context object.
   * @description
   * Prepares the `logger` property for logging throughout
   * the application's life-cycle.
   */
  ctx.readyLogging = () => {
    logger.level = ctx.config.logLevel;

    return ctx;
  };

  /**
   * @function logStarting
   * @returns {StartupContext} The context object.
   * @description
   * Logs that the application is starting.
   */
  ctx.logStarting = () => {
    logger.info(`Starting ec ${ctx.config.version} server.`);
    return ctx;
  };

  /**
   * @function logStarted
   * @returns {StartupContext} The context object.
   * @description
   * Logs that the application startup is complete.
   */
  ctx.logStarted = () => {
    logger.profile('server-startup');
    logger.info(`ec ${ctx.config.version} server started.`, {
      logging: ctx.config.logLevel,
      port: ctx.config.http.port,
    });

    return ctx;
  };

  /**
   * @function logStartError
   * @param {Error} error - An error instance.
   * @returns {StartupContext} The context object.
   * @description
   * Logs that an error has been countered during application startup.
   */
  ctx.logStartError = (error) => {
    logger.profile('server-startup');

    // We're not sure if we have a version when dealing with an error.
    const version = (ctx.config && ctx.config.version) || 'UNKNOWN VERSION';
    logger.error(`Failed to start ec ${version} server.`);

    // Throw the error to create an unhandledRejection.
    throw error;
  };

  return ctx;
}

module.exports = StartupContext;

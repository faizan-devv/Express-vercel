const readyKeyedModels = require('../models/readyKeyedModels');
const logger = require('../boot/logger');
const {getDynamicDbKeys} = require('../utils/dynamicBootHelpers');

/**
 * @function readyModels
 * @param {StartupContext} ctx - A startup context.
 * @returns {Promise.<StartupContext>}
 * @description
 * Prepares models for consumption.
 */
function readyModels(ctx) {
  logger.info('Initializing models.');

  const loadModels = tuple => {
    logger.info(`Loading models for database [${tuple.key}].`);
    const models = readyKeyedModels(tuple.key, tuple.instance);

    logger.info(`Successfully loaded models for database [${tuple.key}].`);

    return Object.assign({}, tuple, {models});
  };

  const captureModels = tuple => {
    ctx.setModels(tuple.key, tuple.models);
  };

  getDynamicDbKeys(ctx.config.databases)
    .map(key => ({key, instance: ctx.config.databases[key]}))
    .map(loadModels)
    .forEach(captureModels);

  logger.info('Model initialization complete.');

  return ctx;
}

module.exports = readyModels;

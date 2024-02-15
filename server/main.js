const logger = require('./boot/logger');
const StartupContext = require('./boot/startupContext');
const loadConfig = require('./boot/loadConfig');
const authenticateSequelize = require('./boot/authenticateSequelize');
const readyModels = require('./boot/readyModels');
const constructServices = require('./boot/constructServices');
const constructExpressApp = require('./boot/constructExpressApp');
const startExpress = require('./boot/startExpress');
const { getIsAppCrashing, gracefulCrash } = require('./utils/gracefulCrash');

/**
 * @function main
 * @param {string} configEnv - Application environment: development, uat, production
 * @description
 * The main entry point for the application.  This performs all
 * work to start up SelectCARE.
 */
function main(configEnv) {
  // We want to treat unhandledRejections as uncaughtExceptions, so we rethrow
  // them.
  process.on('unhandledRejection', (error) => {
    throw error;
  });

  process.on('uncaughtException', async (error) => {
    // Ignore all errors that happen after a crash. We're seeing some errors
    // show up in the logs during a crash, but we're already crashing, so we
    // don't need to log them.
    if (getIsAppCrashing()) {
      return;
    }

    // Kick off graceful crash immediately.
    const gracefulCrashPromise = gracefulCrash();

    // Have logger stop handling exceptions so we don't log exceptions that
    // happen during a crash. This should still log the first exception that
    // kicked this process off.
    logger.exceptions.unhandle();

    process.exitCode = 1;

    // Winston waits 3 seconds before exiting when handling uncaught exceptions
    // itself. Since we can't wait on a Promise returned from Winston, let's
    // make sure we wait at least that long here.
    const loggerPromise = new Promise((resolve) => setTimeout(resolve, 3000));

    await Promise.all([gracefulCrashPromise, loggerPromise]);

    // At this point we should have emptied the event loop by closing the server
    // and database connections. If for some reason, we're still hanging on,
    // give us 2 seconds, and then hard exit with the status code 42, which
    // will be used to signify that the crash wasn't 100% clean. At this point,
    // all database connections should be returned, which is what we're really
    // worried about here.
    //
    // Calling unref() allows the process to exit as long as this timer is the
    // only thing causing the event loop to not be empty.
    setTimeout(() => process.exit(42), 2000).unref();
  });

  // Start timing boot process.
  logger.profile('server-startup');

  const { setConfig, readyLogging, logStarting, logStarted, logStartError } =
    StartupContext();

  return loadConfig(configEnv)
    .then(setConfig)
    .then(readyLogging)
    .then(logStarting)
    .then(authenticateSequelize)
    .then(readyModels)
    .then(constructServices)
    .then(constructExpressApp)
    .then(startExpress)
    .then(logStarted)
    .catch(logStartError);
}

module.exports = main;

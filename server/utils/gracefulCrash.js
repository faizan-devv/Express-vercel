const stoppable = require('stoppable');
const util = require('util');
const logger = require('../boot/logger');

// Give the server 1 second to attempt to drain connections
// before killing them.
const GRACE_PERIOD = 1000;

let isAppCrashing = false;
let asyncServerShutdown;
let postShutdownCleanup;

/**
 *
 * @param {Object[]} databases
 * @returns {function}
 * @description
 * A function that takes a list of databases and returns an async function that
 * will attempt to close them all when invoked.
 */
const cleanupDatabases = databases => async () => {
  const dbCloseResults = await Promise.all(
    Object.values(databases).map(db => {
      // Catch any errors, but don't let them interrupt the Promise.all().
      // At this point, there's not much we can do other than log the
      // errors since we're shutting down.
      return db.close().catch(err => err);
    })
  );

  // Get the errors while closing the database.
  const errors = dbCloseResults.filter(result => result instanceof Error);

  // If there are any errors, log them.
  if (errors.length !== 0) {
    logger.error('Error(s) closing the databases!');
    errors.forEach(err => {
      logger.error(err.stack);
    });
  }
};

/**
 *
 * @returns {boolean}
 * @description
 * Accessor for isAppCrashing variable.
 */
const getIsAppCrashing = () => isAppCrashing;

/**
 *
 * @returns {Promise<void>}
 * @description
 * Attempt to asynchronously crash in a graceful manner.
 */
const gracefulCrash = async () => {
  isAppCrashing = true;

  // We don't ever want to reject the Promise returned from this function, so
  // let's attach empty catch blocks. We're already crashing, so there's no
  // real point in rejecting.
  try {
    if (asyncServerShutdown) {
      const isGraceful = await asyncServerShutdown();

      logger.info(`Graceful crash: ${isGraceful}.`);
    } else {
      logger.info('No server registered for shutdown during graceful crash.');
    }
  } catch (_) {
    logger.error('Error attempting server shutdown.');
  }

  try {
    if (postShutdownCleanup) {
      await postShutdownCleanup();
    } else {
      logger.info(
        'No post-shutdown cleanup function registered for graceful crash.'
      );
    }
  } catch (_) {
    logger.error('Error attempting postShutdownCleanup.');
  }
};

/**
 *
 * @param {http.Server} server
 * @description
 * Register the passed server for asynchronous shutdown on a crash.
 */
const registerServerForShutdown = server => {
  if (asyncServerShutdown) {
    throw new Error('Cannot register more than one server for shutdown.');
  }

  stoppable(server, GRACE_PERIOD);

  asyncServerShutdown = util.promisify(server.stop).bind(server);
};

/**
 *
 * @param {function} fn
 * @description
 * Register this function to be called asynchronously after the server shutdown.
 */
const registerPostShutdownCleanup = fn => {
  if (postShutdownCleanup) {
    throw new Error(
      'Cannot register more than one post shutdown cleanup function.'
    );
  }

  postShutdownCleanup = fn;
};

module.exports = {
  cleanupDatabases,
  getIsAppCrashing,
  gracefulCrash,
  registerPostShutdownCleanup,
  registerServerForShutdown,
};

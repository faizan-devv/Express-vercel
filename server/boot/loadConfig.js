const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
const path = require('path');

const yamlTypesSchema = require('./yaml-types');
const {
  cleanupDatabases,
  registerPostShutdownCleanup,
} = require('../utils/gracefulCrash');

const readFile = util.promisify(fs.readFile);

const BASE_PATH = process.cwd();

/**
 * @function loadConfig
 * @param {string} configEnv - The application's configuration environment.
 * @returns {Promise.<{}>} A promise to a configuration object instance.
 * @description
 * Loads a configuration object from a YAML file.  The file's
 * location is an opinion at the current time and is expected
 * to be at `process.cwd()/config/${configEnv}.yaml`.
 */
function loadConfig(configEnv) {
  const filePath = path.join(BASE_PATH, `config/${configEnv}.yaml`);

  return readFile(filePath, 'utf8')
    .then(contents => yaml.load(contents, {schema: yamlTypesSchema}))
    .then(config => {
      //Make sure we have a node environment set.
      config.nodeEnv = config.nodeEnv || 'development';

      //Set the NODE_ENV environment variable for other packages to use.
      //Internally, we should use config.nodeEnv because accessing the
      //environment on the process is expensive, but other packages
      //rely on process.env.NODE_ENV being set.
      process.env.NODE_ENV = config.nodeEnv;

      registerPostShutdownCleanup(cleanupDatabases(config.databases));

      //Return the config object including the configEnv.
      return {...config, configEnv};
    });
}

module.exports = loadConfig;

const yaml = require('js-yaml');
const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const factories = {
  /**
   * @function sequelize:mysql
   * @param {object} dbConfig - Configuration object for the connection.
   * @returns {Sequelize}
   * @description
   * Creates a sequelize instance using configuration values specified.
   */
  'sequelize:mysql': (dbConfig) => {
    const logger = require('../logger');

    const sqlOptions = {
      host: dbConfig.host,
      dialect: 'mysql',
      port: dbConfig.port || 3306,
      logging: (msg, executionTime) => logger.info(msg, { executionTime }),
      benchmark: true,
      options: {
        requestTimeout: 30000,
        useUTC: false,
      },
      timezone: '+05:00',
      retry: {
        max: 2,
      },
    };

    // Allow optional configuration of connection pooling.
    if (dbConfig.pool && typeof dbConfig.pool === 'object') {
      sqlOptions.pool = dbConfig.pool;
    }
    if (sqlOptions.dialect === 'mysql') {
      sqlOptions.dialectModule = mysql2; // Needed to fix sequelize issues with WebPack
    }
    return new Sequelize(
      dbConfig.name,
      dbConfig.username,
      dbConfig.password,
      sqlOptions
    );
  },
}; // </factories>

// Create the YAML Type instance to support the
// !database tag.  If a factory exists for the database
// type, an instance is returned, otherwise null.
const database = new yaml.Type('!database', {
  kind: 'mapping',
  construct: (data) => {
    const dbConfig = data;

    const factory = factories[dbConfig.type];

    let instance = null;

    if (factory) {
      instance = factory(dbConfig);
    }

    return instance;
  },
});

module.exports = database;

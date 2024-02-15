const { createLogger, format: winstonFormat, transports } = require('winston');

const { configEnv, logLevel } = require('./config');

const _getFormat = (configEnv, winstonFormat) => {
  const baseFormat = winstonFormat.combine(
    winstonFormat.timestamp(),
    winstonFormat.errors({ stack: true }),
    winstonFormat.json()
  );

  // Pretty print the config with colors when we're local.
  if (
    configEnv === 'local' ||
    configEnv === 'development' ||
    configEnv === 'production'
  ) {
    return winstonFormat.combine(
      baseFormat,
      winstonFormat.prettyPrint({ colorize: true })
    );
  }

  return baseFormat;
};

module.exports = createLogger({
  level: logLevel,
  format: _getFormat(configEnv, winstonFormat),
  defaultMeta: { service: 'ec-server' },
  transports: [new transports.Console({ handleExceptions: true })],
  exitOnError: false,
});

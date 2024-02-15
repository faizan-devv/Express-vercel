const configEnv = process.env.CONFIG_ENV || 'local';

const main = require('./server/main');
main(configEnv);
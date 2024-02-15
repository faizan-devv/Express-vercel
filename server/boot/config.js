const readYaml = require('read-yaml');
const yamlTypesSchema = require('./yaml-types');
const configEnv = process.env.CONFIG_ENV || 'local';
const config = {
  configEnv,
  ...readYaml.sync(`config/${configEnv}.yaml`, {schema: yamlTypesSchema}),
};

module.exports = config;

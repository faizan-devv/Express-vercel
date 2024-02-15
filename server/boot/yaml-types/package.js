const yaml = require('js-yaml');
const path = require('path');

const BASE_PATH = process.cwd();

const packageJSON = require(path.join(BASE_PATH, 'package.json'));

// Create the YAML Type instance that allows simple
// package value creation.  This does not support
// dot-notation pathing.  Not supported: `!package scripts.start`
// `!package scripts` would get the scripts object that would
// then have the `start` property.
const packageType = new yaml.Type('!package', {
  kind: 'scalar',
  construct: data => {
    return packageJSON[data];
  },
});

module.exports = packageType;

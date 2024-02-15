const yaml = require('js-yaml');
const types = [require('./database'), require('./package')];

// Build a Schema instance for js-yaml to properly
// support our custom tags.
module.exports = yaml.Schema.create(types);

const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const loadDropDowns = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).countries.loadDropDowns().then(toJSON)
);

module.exports = {
  loadDropDowns,
};

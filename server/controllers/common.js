const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const uploadPicture = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .common.uploadPicture(req.params, req.file.filename, req.file.path)
    .then(toJSON)
);

const fetchCountryDropDowns = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).common.fetchCountryDropDowns(req.params).then(toJSON)
);

module.exports = {
  uploadPicture,
  fetchCountryDropDowns,
};

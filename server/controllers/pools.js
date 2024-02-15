const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const createPool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.createPool(req.body).then(toJSON)
);
const updatePool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.updatePool(req.body).then(toJSON)
);
const deletePool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.deletePool(req.params).then(toJSON)
);
const deleteApplicantFromPool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.deleteApplicantFromPool(req.body).then(toJSON)
);
const fetchAllPools = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.fetchAllPools(req.params).then(toJSON)
);
const fetchPipelineStages = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.fetchPipelineStages(req.params).then(toJSON)
);
const copyPool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.copyPool(req.body).then(toJSON)
);
const fetchPaginatedPools = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.fetchPaginatedPools(req.body).then(toJSON)
);
const fetchPool = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).pools.fetchPool(req.params).then(toJSON)
);

module.exports = {
  fetchPool,
  fetchPaginatedPools,
  copyPool,
  fetchPipelineStages,
  fetchAllPools,
  deletePool,
  deleteApplicantFromPool,
  updatePool,
  createPool,
};

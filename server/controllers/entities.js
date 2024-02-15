const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const getAll = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .entities.getAll(req.params.entityName, req.query)
    .then(toJSON)
);

const getByID = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .entities.getByID(req.params.entityName, req.params.id)
    .then(toJSON)
);

const create = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .entities.create(req.params.entityName, req.body)
    .then(toJSON)
);

const update = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .entities.update(req.params.entityName, req.params.id, req.body)
    .then(toJSON)
);

const destroy = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .entities.destroy(req.params.entityName, req.params.id, req.params.userId)
    .then(toJSON)
);

module.exports = {
  create,
  getAll,
  getByID,
  update,
  destroy,
};

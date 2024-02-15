const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';
const fetchRoles = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.fetchRoles(req.params).then(toJSON)
);
const createRole = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.createRole(req.body).then(toJSON)
);
const deleteRole = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.deleteRole(req.params).then(toJSON)
);
const updateRole = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.updateRole(req.body).then(toJSON)
);
const fetchRoleData = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.fetchRoleData(req.params).then(toJSON)
);
const fetchPermissionsGrid = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).roles.fetchPermissionsGrid().then(toJSON)
);
module.exports = {
  fetchRoles,
  fetchPermissionsGrid,
  fetchRoleData,
  updateRole,
  deleteRole,
  createRole,
};

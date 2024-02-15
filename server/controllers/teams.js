const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const createTeam = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).teams.createTeam(req.body).then(toJSON)
);
const fetchAllTeams = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).teams.fetchAllTeams(req.params).then(toJSON)
);
const fetchTeam = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).teams.fetchTeam(req.params).then(toJSON)
);
const deleteTeam = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).teams.deleteTeam(req.params).then(toJSON)
);
const updateTeam = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).teams.updateTeam(req.body).then(toJSON)
);
module.exports = {
  updateTeam,
  deleteTeam,
  fetchTeam,
  fetchAllTeams,
  createTeam,
};

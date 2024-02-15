const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const createScoreCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.createScoreCard(req.body).then(toJSON)
);

const updateScoreCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.updateScoreCard(req.body).then(toJSON)
);

const fetchAllScoreCards = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.fetchAllScoreCards(req.params).then(toJSON)
);

const deleteScoreCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.deleteScoreCard(req.params).then(toJSON)
);

const fetchScoreCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.fetchScoreCard(req.params).then(toJSON)
);

const copyScoreCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).scorecard.copyScoreCard(req.body).then(toJSON)
);

const addUserCandidateScorecards = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .scorecard.addUserCandidateScorecards(req.body)
    .then(toJSON)
);
const fetchUserCandidateScorecards = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .scorecard.fetchUserCandidateScorecards(req.params)
    .then(toJSON)
);
const editUserCandidateScorecards = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .scorecard.editUserCandidateScorecards(req.body)
    .then(toJSON)
);
const fetchandCreateUserTeamScorecard = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .scorecard.fetchandCreateUserTeamScorecard(req.params)
    .then(toJSON)
);

module.exports = {
  fetchandCreateUserTeamScorecard,
  editUserCandidateScorecards,
  fetchUserCandidateScorecards,
  addUserCandidateScorecards,
  copyScoreCard,
  deleteScoreCard,
  fetchScoreCard,
  fetchAllScoreCards,
  createScoreCard,
  updateScoreCard,
};

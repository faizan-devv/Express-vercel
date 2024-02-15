const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');

module.exports = (controllers) => {
  const scoreCardRouter = new Router();
  scoreCardRouter.use(verifyJWT);
  scoreCardRouter.get(
    '/fetch-scorecards/:companyId',
    verifyPermission,
    controllers.scorecard.fetchAllScoreCards
  );
  scoreCardRouter.put(
    '/update-scorecard',
    verifyPermission,
    controllers.scorecard.updateScoreCard
  );
  scoreCardRouter.post(
    '/create-scorecard',
    verifyPermission,
    controllers.scorecard.createScoreCard
  );

  scoreCardRouter.post(
    '/copy-scorecard',
    verifyPermission,
    controllers.scorecard.copyScoreCard
  );
  scoreCardRouter.delete(
    '/delete-scorecard/:scoreCardId/:userId',
    verifyPermission,
    controllers.scorecard.deleteScoreCard
  );
  scoreCardRouter.post(
    '/create-user-scorecards',
    verifyPermission,
    controllers.scorecard.addUserCandidateScorecards
  );
  scoreCardRouter.put(
    '/update-user-scorecards',
    verifyPermission,
    controllers.scorecard.editUserCandidateScorecards
  );
  scoreCardRouter.get(
    '/fetch-team-scorecard/:applicantId',
    verifyPermission,
    controllers.scorecard.fetchandCreateUserTeamScorecard
  );
  scoreCardRouter.get(
    '/fetch-user-scorecards/:userId/:applicationId/:jobId/:applicantId',
    verifyPermission,
    controllers.scorecard.fetchUserCandidateScorecards
  );
  scoreCardRouter.get(
    '/fetch-scorecard/:companyId/:scoreCardId',
    controllers.scorecard.fetchScoreCard
  );

  return scoreCardRouter;
};

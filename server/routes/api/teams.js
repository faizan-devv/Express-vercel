const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');

module.exports = (controllers) => {
  const teamsRouter = new Router();
  teamsRouter.use(verifyJWT);
  teamsRouter.post(
    '/create-team',
    verifyPermission,
    controllers.teams.createTeam
  );
  teamsRouter.put(
    '/update-team',
    verifyPermission,
    controllers.teams.updateTeam
  );
  teamsRouter.delete(
    '/delete-team/:teamId/:userId',
    verifyPermission,
    controllers.teams.deleteTeam
  );
  teamsRouter.get(
    '/fetch-teams/:companyId',
    verifyPermission,
    controllers.teams.fetchAllTeams
  );
  teamsRouter.get(
    '/fetch-team/:teamId',
    verifyPermission,
    controllers.teams.fetchTeam
  );
  return teamsRouter;
};

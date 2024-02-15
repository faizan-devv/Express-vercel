const { Router } = require('express');
const common = require('./common');
const entitiesRoutes = require('./entities');
const usersRoutes = require('./users');
const countriesRoutes = require('./countries');
const companiesRoutes = require('./companies');
const jobsRoutes = require('./jobs');
const applicantsRoutes = require('./applicants');
const poolsRoutes = require('./pools');
const teamsRoutes = require('./teams');
const scoreCardRoutes = require('./scorecard');
const rolesRoutes = require('./roles');

module.exports = (controllers) => {
  const ecRouter = new Router();

  ecRouter.use('/entities', entitiesRoutes(controllers));
  ecRouter.use('/users', usersRoutes(controllers));
  ecRouter.use('/common', common(controllers));
  ecRouter.use('/countries', countriesRoutes(controllers));
  ecRouter.use('/companies', companiesRoutes(controllers));
  ecRouter.use('/jobs', jobsRoutes(controllers));
  ecRouter.use('/applicants', applicantsRoutes(controllers));
  ecRouter.use('/pools', poolsRoutes(controllers));
  ecRouter.use('/teams', teamsRoutes(controllers));
  ecRouter.use('/scorecard', scoreCardRoutes(controllers));
  ecRouter.use('/roles', rolesRoutes(controllers));

  return ecRouter;
};

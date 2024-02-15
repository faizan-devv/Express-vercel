const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');

module.exports = (controllers) => {
  const poolsRouter = new Router();
  poolsRouter.use(verifyJWT);
  poolsRouter.post(
    '/create-pool',
    verifyPermission,
    controllers.pools.createPool
  );
  poolsRouter.post('/copy-pool', verifyPermission, controllers.pools.copyPool);
  poolsRouter.post(
    '/fetch-paginated-pools',
    verifyPermission,
    controllers.pools.fetchPaginatedPools
  );
  poolsRouter.put(
    '/update-pool',
    verifyPermission,
    controllers.pools.updatePool
  );
  poolsRouter.delete(
    '/delete-pool/:poolId',
    verifyPermission,
    controllers.pools.deletePool
  );
  poolsRouter.delete(
    '/delete-pool-applicant',
    verifyPermission,
    controllers.pools.deleteApplicantFromPool
  );
  poolsRouter.get('/fetch-pools/:companyId', controllers.pools.fetchAllPools);
  poolsRouter.get(
    '/fetch-pool/:companyId/:poolId',
    controllers.pools.fetchPool
  );
  poolsRouter.get(
    '/fetch-pipeline-stages/:poolId',
    controllers.pools.fetchPipelineStages
  );
  return poolsRouter;
};

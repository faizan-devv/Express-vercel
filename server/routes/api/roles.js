const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');

module.exports = (controllers) => {
  const rolesRouter = new Router();
  rolesRouter.use(verifyJWT);
  rolesRouter.get(
    '/fetch-roles/:companyId/',
    verifyPermission,
    controllers.roles.fetchRoles
  );
  rolesRouter.get(
    '/fetch-permissions-grid',
    verifyPermission,
    controllers.roles.fetchPermissionsGrid
  );
  rolesRouter.get(
    '/fetch-role/:roleId/',
    verifyPermission,
    controllers.roles.fetchRoleData
  );
  rolesRouter.post(
    '/create-role',
    verifyPermission,
    controllers.roles.createRole
  );
  rolesRouter.put(
    '/update-role',
    verifyPermission,
    controllers.roles.updateRole
  );
  rolesRouter.delete(
    '/delete-role/:roleId/:userId',
    verifyPermission,
    controllers.roles.deleteRole
  );
  return rolesRouter;
};

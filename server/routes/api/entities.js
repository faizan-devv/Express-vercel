const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');

module.exports = (controllers) => {
  const entitiesRouter = new Router();

  entitiesRouter.use(verifyJWT);

  entitiesRouter.get('/:entityName', controllers.entities.getAll);

  entitiesRouter.get('/:entityName/:id', controllers.entities.getByID);

  entitiesRouter.post('/:entityName', controllers.entities.create);

  entitiesRouter.patch('/:entityName/:id', controllers.entities.update);

  entitiesRouter.delete(
    '/:entityName/:id/:userId',
    controllers.entities.destroy
  );

  return entitiesRouter;
};

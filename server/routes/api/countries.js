const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');

module.exports = (controllers) => {
  const countriesRouter = new Router();

  countriesRouter.use(verifyJWT);

  countriesRouter.get('/dropdown-data', controllers.countries.loadDropDowns);
  return countriesRouter;
};

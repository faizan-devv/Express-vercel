const { Router } = require('express');
const apiRouterFactory = require('./api');

function routesFactory(controllers) {
  const router = new Router();

  router.get('/healthcheck', (_, res) => res.send('I am alive !'));

  router.use('/api', apiRouterFactory(controllers));

  return router;
}

module.exports = routesFactory;

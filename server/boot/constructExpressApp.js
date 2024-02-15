const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const expressSession = require('express-session');
const cache = require('./cache');
const logger = require('./logger');
const controllersFactory = require('../controllers');
const siteRouterFactory = require('../routes');
const { getIsAppCrashing } = require('../utils/gracefulCrash');

/**
 * @function constructExpressApp
 * @param {StartupContext} ctx - A startup context.
 * @returns {StartupContext}
 * @description
 * Builds the express instance for the application.
 */
function constructExpressApp(ctx) {
  logger.info('Initializing express web server.');

  const app = express();

  const sessionConfig = {
    secret: ctx.config.http.sessionSecret,
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      maxAge: ctx.config.http.sessionTimeout,
      domain: ctx.config.http.sessionDomain,
    },
  };

  app.set('trust proxy', 'loopback');

  app.use((req, res, next) => {
    if (getIsAppCrashing()) {
      res.sendStatus(503);
    } else {
      next();
    }
  });

  app.use(morgan('combined'));

  app.use((req, res, next) => {
    if (req.path !== '/api/companies/webhook') {
      express.json()(req, res, next);
    } else {
      next();
    }
  });
  // app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use(compression());
  app.use(expressSession(sessionConfig));
  app.use((req, res, next) => {
    // Dependency injection for the request:
    req.models = ctx.models;
    req.services = ctx.services;
    req.config = ctx.config;
    req.cache = cache;
    next();
  });

  const controllers = controllersFactory();

  const siteRouter = siteRouterFactory(controllers);

  var options = {
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.use(cors(options));

  app.use('/', siteRouter);

  ctx.setExpress(app);

  logger.info('Express web server initialized.');

  return ctx;
}

module.exports = constructExpressApp;

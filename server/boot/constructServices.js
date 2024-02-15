const services = require('../services');
const logger = require('../boot/logger');

/**
 * @function constructServices
 * @param {StartupContext} ctx - A startup context.
 * @returns {Promise.<StartupContext>}
 * @description
 * Main point that instantiates services for use throughout the system.
 */
async function constructServices(ctx) {
  logger.info('Starting services initialization.');
  ctx.setServices('ec', createEcServices(ctx));
  /* we want to run this users.initalize() function below to fetch all api tokens of users and fetch them from process memory 
  instead of querying db again and again. Redis Cache can be implemented here in future !*/
  await ctx.services.get('ec').users.initalize(true);
  logger.info('Service initialization complete.');

  return ctx;
}

function createEcServices(ctx) {
  return {
    users: new services.UsersService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.secret,
      ctx.config.api.SENDGRID_API_KEY,
      ctx.config.api.url,
      ctx.config.resetUrl,
      ctx.config.api.senderEmail,
      ctx.config.api.passwordExpirationTimeMS,
      ctx.config.api.apiBaseUrl,
      ctx.config.googleOAuth.CREDENTIALS_PATH,
      ctx.config.api.API_TOKEN_ENCRYPTION_KEY,
      ctx.config.api.ENCRYPTION_IV,
      ctx.config.api.clientBaseUrl,
      ctx.config.zoom,
      ctx.config.slack
    ),
    common: new services.CommonService(
      ctx.models.get('ec'),
      ctx.config.databases.ec
    ),
    entities: new services.Entities(ctx.models.get('ec')),
    countries: new services.CountriesService(
      ctx.models.get('ec'),
      ctx.config.databases.ec
    ),
    companies: new services.CompaniesService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.api.apiBaseUrl,
      ctx.config.api.clientBaseUrl,
      ctx.config.api.senderEmail,
      ctx.config.api.SENDGRID_API_KEY
    ),
    jobs: new services.JobsService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.api.SENDGRID_API_KEY,
      ctx.config.api.apiBaseUrl,
      ctx.config.api.clientBaseUrl,
      ctx.config.api.slack
    ),
    applicants: new services.ApplicantsService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.api.SENDGRID_API_KEY,
      ctx.config.api.senderEmail,
      ctx.config.api.apiBaseUrl,
      ctx.config.offerUrl,
      ctx.config.api.clientBaseUrl,
      ctx.config.slack
    ),
    pools: new services.PoolService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.api.SENDGRID_API_KEY,
      ctx.config.api.apiBaseUrl,
      ctx.config.api.clientBaseUrl,
      ctx.config.api.slack
    ),
    teams: new services.TeamsService(
      ctx.models.get('ec'),
      ctx.config.databases.ec,
      ctx.config.api.SENDGRID_API_KEY,
      ctx.config.api.apiBaseUrl,
      ctx.config.api.clientBaseUrl,
      ctx.config.api.slack
    ),
    scorecard: new services.ScoreCardService(
      ctx.models.get('ec'),
      ctx.config.databases.ec
    ),
    roles: new services.RolesService(
      ctx.models.get('ec'),
      ctx.config.databases.ec
    ),
  };
}

module.exports = constructServices;

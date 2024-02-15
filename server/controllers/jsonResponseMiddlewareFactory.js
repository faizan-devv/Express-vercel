const logger = require('../boot/logger');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errorTypes');

function getStatusCode(err) {
  if (err instanceof BadRequestError) {
    return 400;
  }

  if (err instanceof ForbiddenError) {
    return 403;
  }

  if (err instanceof NotFoundError) {
    return 404;
  }

  if (err instanceof NotFoundError) {
    return 404;
  }

  return 500;
}

/**
 * @function jsonResponseMiddlewareFactory
 * @param {function} promiser - Function that provides a promised result.
 * @returns {function} A middleware function.
 * @description
 * jsonResponseMiddlewareFactory creates a tidy wrapper for API controller middleware.
 */
const jsonResponseMiddlewareFactory = (promiser) => (req, res) =>
  promiser(req)
    .then((item) => {
      if (item.description === 'Stripe webhook success') {
        res.status(200).send();
      } else {
        res.json(item);
      }
      // if (item.session?.description === 'Stripe API redirect') {
      //   res.redirect(item.session.status, item.session.url);
      // }
    })
    .catch((err) => {
      logger.error(err);

      // We attach the error to the res object so we can access it outside of
      // this function.
      res.error = err;

      const payload = {
        success: false,
        message: err.message,
      };

      const statusCode = getStatusCode(err);
      if (statusCode) res.status(statusCode).json(payload);
    });

module.exports = jsonResponseMiddlewareFactory;

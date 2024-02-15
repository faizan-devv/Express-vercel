const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');
const express = require('express');
const fileExtensions = require('../../utils/fileExtensions');

const multer = require('multer');
const {
  FILE_SIZE,
  COMPANIES_PATH,
} = require('../../constants/multerConstants');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, COMPANIES_PATH);
  },
  filename: (req, file, callback) => {
    const { companyId } = req.body;
    const modifiedFileName = file.originalname.split(' ').join('');
    const fileName = 'companies' + '-' + Date.now() + '-' + modifiedFileName;
    callback(null, fileName);
  },
  onError: function (err, next) {
    next(err);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: FILE_SIZE }, // 3MB
  fileFilter: function (req, file, callback) {
    const fileExtension = file.originalname.split('.')[1];
    if (!fileExtensions.includes(fileExtension)) {
      req.faultyResume = true;
      return callback(
        new Error('Incorrect Company logo or banner file extension found')
      );
    }
    callback(null, true);
  },
});

module.exports = (controllers) => {
  const companiesRouter = new Router();
  companiesRouter.use(express.static(COMPANIES_PATH));
  companiesRouter.get(
    '/company-data-by-name/:companyName',
    controllers.companies.fetchCompanyDataByName
  );
  companiesRouter.get(
    '/fetch-public-companywise-cities/:companyId',
    controllers.companies.fetchPublicCompanyWiseCities
  );

  companiesRouter.use(verifyJWT);

  companiesRouter.get(
    '/fetch-company-data/:companyId',
    verifyPermission,
    controllers.companies.fetchCompanyData
  );

  companiesRouter.get(
    '/locations/:companyId',
    verifyPermission,
    controllers.companies.fetchLocations
  );

  companiesRouter.put(
    '/set-primary-location',
    verifyPermission,
    controllers.companies.setPrimaryLocation
  );

  companiesRouter.put(
    '/update-details',
    verifyPermission,
    upload.fields([
      { name: 'banner', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
    controllers.companies.updateDetails
  );

  companiesRouter.post(
    '/add-location',
    verifyPermission,
    controllers.companies.addLocation
  );

  companiesRouter.put(
    '/edit-location',
    verifyPermission,
    controllers.companies.editLocation
  );

  companiesRouter.delete(
    '/delete-location/:locationId',
    verifyPermission,
    controllers.companies.deleteLocation
  );

  companiesRouter.get(
    '/pipeline/:companyId',
    verifyPermission,
    controllers.companies.fetchAllPipelines
  );

  companiesRouter.post(
    '/create-pipeline',
    verifyPermission,
    controllers.companies.createPipeline
  );
  companiesRouter.post(
    '/copy-pipeline',
    verifyPermission,
    controllers.companies.copyPipeline
  );
  companiesRouter.put(
    '/update-pipeline',
    verifyPermission,
    controllers.companies.updatePipeline
  );
  companiesRouter.delete(
    '/delete-pipeline/:pipelineId',
    controllers.companies.deletePipeline
  );
  companiesRouter.get(
    '/pipeline-stages/:pipelineId',
    controllers.companies.fetchAllPipelineStages
  );
  companiesRouter.get(
    '/pools-positions-union/:companyId',
    controllers.companies.fetchAllPoolAndPositions
  );
  companiesRouter.delete(
    '/delete-subscription/:companyId/:userId',
    controllers.companies.deleteSubscription
  );
  companiesRouter.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    controllers.companies.webhook
  );
  companiesRouter.post(
    '/portal-stripe',
    controllers.companies.createPortalStripe
  );
  companiesRouter.post(
    '/checkout-stripe',
    controllers.companies.createCheckoutStripe
  );
  companiesRouter.post(
    '/fetch-company-module-rights-per-plan',
    controllers.companies.fetchCompanyModuleRightsPerPlan
  );
  companiesRouter.put(
    '/update-card-db',
    controllers.companies.updateCardDataDb
  );

  companiesRouter.put(
    '/update-pricing-plan',
    controllers.companies.updatePricingPlan
  );
  companiesRouter.put(
    '/update-subscription-card',
    controllers.companies.updateSubscriptionCard
  );
  companiesRouter.get(
    '/fetch-generic-search/:companyId/:name',
    controllers.companies.fetchGenericSearch
  );
  companiesRouter.get(
    '/all-plans-benefits/:companyId',
    controllers.companies.fetchAllPlansAndBenefits
  );
  companiesRouter.get(
    '/fetch-company-billing/:companyId',
    controllers.companies.fetchCompanyBillingData
  );

  companiesRouter.get(
    '/fetch-company-plan-rights/:companyId',
    controllers.companies.fetchCompanyPlanRights
  );
  companiesRouter.use((err, req, res, next) => {
    // middleware for handling multer file wrong extension case
    if (err) {
      if (req.faultyResume === true)
        res.status(400).json({ success: false, message: err.message });
    }
  });

  companiesRouter.get(
    '/fetch-feedback-questions/',
    controllers.companies.fetchFeedbackQuestions
  );
  companiesRouter.post(
    '/create-feedback-answers',
    controllers.companies.createFeedbackAnswers
  );
  return companiesRouter;
};

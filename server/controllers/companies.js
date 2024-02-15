const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const updateDetails = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.updateDetails(req.body, req.files).then(toJSON)
);

const fetchCompanyData = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchCompanyData(req.params).then(toJSON)
);

const addLocation = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.addLocation(req.body).then(toJSON)
);

const setPrimaryLocation = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.setPrimaryLocation(req.body).then(toJSON)
);

const fetchLocations = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchLocations(req.params).then(toJSON)
);

const deleteLocation = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.deleteLocation(req.params).then(toJSON)
);

const editLocation = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.editLocation(req.body).then(toJSON)
);

const fetchCompanyDataByName = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchCompanyDataByName(req.params).then(toJSON)
);

const fetchPublicCompanyWiseCities = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchPublicCompanyWiseCities(req.params)
    .then(toJSON)
);

const createPipeline = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.createPipeline(req.body).then(toJSON)
);

const updatePipeline = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.updatePipeline(req.body).then(toJSON)
);

const fetchAllPipelineStages = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchAllPipelineStages(req.params).then(toJSON)
);

const fetchAllPipelines = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchAllPipelines(req.params).then(toJSON)
);

const deletePipeline = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.deletePipeline(req.params).then(toJSON)
);

const copyPipeline = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.copyPipeline(req.body).then(toJSON)
);

const fetchAllPoolAndPositions = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchAllPoolAndPositions(req.params)
    .then(toJSON)
);
const fetchGenericSearch = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchGenericSearch(req.params).then(toJSON)
);
const fetchAllPlansAndBenefits = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchAllPlansAndBenefits(req.params)
    .then(toJSON)
);
const fetchCompanyBillingData = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchCompanyBillingData(req.params)
    .then(toJSON)
);
const createCheckoutStripe = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.createCheckoutStripe(req.body).then(toJSON)
);
const createPortalStripe = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.createPortalStripe(req.body).then(toJSON)
);
const webhook = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.webhook(req).then(toJSON)
);
const updatePricingPlan = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.updatePricingPlan(req.body).then(toJSON)
);
const deleteSubscription = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.deleteSubscription(req.params).then(toJSON)
);
const fetchCompanyPlanRights = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.fetchCompanyPlanRights(req.params).then(toJSON)
);
const fetchCompanyModuleRightsPerPlan = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchCompanyModuleRightsPerPlan(req.body)
    .then(toJSON)
);
const updateSubscriptionCard = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.updateSubscriptionCard(req.body).then(toJSON)
);
const updateCardDataDb = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.updateCardDataDb(req.body).then(toJSON)
);

const fetchFeedbackQuestions = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .companies.fetchFeedbackQuestions()
    .then(toJSON)
);

const createFeedbackAnswers = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).companies.createFeedbackAnswers(req.body).then(toJSON)
);

module.exports = {
  updateCardDataDb,
  updateSubscriptionCard,
  deleteSubscription,
  updatePricingPlan,
  webhook,
  createPortalStripe,
  createCheckoutStripe,
  fetchCompanyBillingData,
  fetchAllPlansAndBenefits,
  fetchGenericSearch,
  fetchAllPoolAndPositions,
  copyPipeline,
  updatePipeline,
  deletePipeline,
  fetchAllPipelines,
  fetchAllPipelineStages,
  updatePipeline,
  createPipeline,
  fetchPublicCompanyWiseCities,
  fetchCompanyDataByName,
  editLocation,
  deleteLocation,
  fetchLocations,
  setPrimaryLocation,
  addLocation,
  updateDetails,
  fetchCompanyData,
  fetchCompanyPlanRights,
  fetchCompanyModuleRightsPerPlan,
  fetchFeedbackQuestions,
  createFeedbackAnswers,
};

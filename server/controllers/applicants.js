const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const createApplicant = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.createApplicant(req.body, req.file)
    .then(toJSON)
);

const addCandidateResume = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.addCandidateResume(req.body, req.file)
    .then(toJSON)
);
const addEditCandidatePicture = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.addEditCandidatePicture(req.body, req.file)
    .then(toJSON)
);

const createPublicApplicant = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.createPublicApplicant(req.body, req.files)
    .then(toJSON)
);
const verifyOTP = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.verifyOTP(req.body).then(toJSON)
);
const resendOTP = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.resendOTP(req.body).then(toJSON)
);
const getJobPipelineFirstStageId = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.getJobPipelineFirstStageId(req.body)
    .then(toJSON)
);

const fetchAllApplicants = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchAllApplicants(req.body).then(toJSON)
);

const updateResume = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.updateResume(req.body, req.file).then(toJSON)
);

const deleteApplicants = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.deleteApplicants(req.body).then(toJSON)
);

const deleteEducation = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.deleteEducation(req.body).then(toJSON)
);

const deleteExperience = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.deleteExperience(req.body).then(toJSON)
);

const updateCandidateTags = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.updateCandidateTags(req.body).then(toJSON)
);

const moveApplicants = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.moveApplicants(req.body).then(toJSON)
);
const editApplicantPersonalInfo = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.editApplicantPersonalInfo(req.body)
    .then(toJSON)
);
const addEditCandidateExperience = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.addEditCandidateExperience(req.body)
    .then(toJSON)
);
const addEditCandidateEducation = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.addEditCandidateEducation(req.body)
    .then(toJSON)
);
const deleteApplication = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.deleteApplication(req.body).then(toJSON)
);

const fetchParsedApplicant = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchParsedApplicant(req.params).then(toJSON)
);

const editParsedApplicant = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.editParsedApplicant(req.body).then(toJSON)
);

const setApplicantNote = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.setApplicantNote(req.body).then(toJSON)
);
const deleteApplicantNote = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.deleteApplicantNote(req.body).then(toJSON)
);

const uploadDocument = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.uploadDocument(req.body, req.file)
    .then(toJSON)
);

const commentApplicantDiscussion = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.commentApplicantDiscussion(req.body)
    .then(toJSON)
);

const fetchApplicantDiscussion = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.fetchApplicantDiscussion(req.params)
    .then(toJSON)
);
const moveApplicantsStages = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.moveApplicantsStages(req.body).then(toJSON)
);
const createOffer = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.createOffer(req.body, req.file).then(toJSON)
);
const fetchOfferStatuses = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchOfferStatuses().then(toJSON)
);
const fetchAllOffers = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchAllOffers(req.params).then(toJSON)
);
const fetchNotes = jsonResponseMiddlewareFactory((req) =>
req.services
.get(ec)
.applicants.fetchNotes(req.body)
.then(toJSON)
);
const fetchAllDocuments = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchAllDocuments(req.params).then(toJSON)
);
const updateOfferStatus = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.updateOfferStatus(req.body).then(toJSON)
);
const fetchOffer = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchOffer(req.params).then(toJSON)
);
const fetchPublicApplicants = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.fetchPublicApplicants(req.body).then(toJSON)
);
const manageApplicant = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.manageApplicant(req.body).then(toJSON)
);
const parseApplicantResume = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).applicants.parseApplicantResume(req.file).then(toJSON)
);
const calculateApplicantRelevancyScore = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.calculateApplicantRelevancyScore(req.body)
    .then(toJSON)
);
const fetchCityStateCountryByName = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .applicants.fetchCityStateCountryByName(req.params)
    .then(toJSON)
);

module.exports = {
  calculateApplicantRelevancyScore,
  parseApplicantResume,
  manageApplicant,
  fetchPublicApplicants,
  fetchOffer,
  updateOfferStatus,
  fetchAllDocuments,
  fetchNotes,
  fetchOfferStatuses,
  fetchAllOffers,
  createOffer,
  moveApplicantsStages,
  fetchApplicantDiscussion,
  commentApplicantDiscussion,
  uploadDocument,
  setApplicantNote,
  editParsedApplicant,
  fetchParsedApplicant,
  moveApplicants,
  updateCandidateTags,
  deleteApplicants,
  deleteApplication,
  updateResume,
  fetchAllApplicants,
  createApplicant,
  createPublicApplicant,
  verifyOTP,
  resendOTP,
  getJobPipelineFirstStageId,
  fetchCityStateCountryByName,
  editApplicantPersonalInfo,
  addEditCandidateExperience,
  addEditCandidateEducation,
  deleteEducation,
  deleteExperience,
  addCandidateResume,
  addEditCandidatePicture,
  deleteApplicantNote,
};

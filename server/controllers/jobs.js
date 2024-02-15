const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const ec = 'ec';

const createJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.createJob(req.body).then(toJSON)
);

const populateDropDowns = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.populateDropDowns(req.params).then(toJSON)
);

const fetchPaginatedJobsList = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPaginatedJobsList(req.body).then(toJSON)
);

const fetchKanbanBoardData = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchKanbanBoardData(req.body).then(toJSON)
);

const fetchJobTeamData = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchJobTeamData(req.body).then(toJSON)
);

const updateJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.updateJob(req.body).then(toJSON)
);

const prefetchEditJobData = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.prefetchEditJobData(req.params).then(toJSON)
);

const createExternalCompanyJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.createExternalCompanyJob(req.body).then(toJSON)
);

const deleteJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.deleteJob(req.params).then(toJSON)
);

const fetchPublicJobs = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPublicJobs(req.body).then(toJSON)
);

const fetchJobFromHash = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchJobFromHash(req.params).then(toJSON)
);

const fetchPublicDompanyDepartment = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPublicDompanyDepartment(req.params).then(toJSON)
);

const fetchCompanyLocations = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchCompanyLocations(req.params).then(toJSON)
);

const fetchPositionCompanyLocations = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPositionCompanyLocations(req.params).then(toJSON)
);

const fetchInternalAppCompanyLocations = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchInternalAppCompanyLocations(req.params).then(toJSON)
);
const fetchPublicJobTypes = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPublicJobTypes(req.params).then(toJSON)
);

const createJobDescriptionTemplate = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.createJobDescriptionTemplate(req.body).then(toJSON)
);

const copyJobDescriptionTemplate = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.copyJobDescriptionTemplate(req.body).then(toJSON)
);

const fetchPipelineStages = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.fetchPipelineStages(req.params).then(toJSON)
);

const createJobDraft = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.createJobDraft(req.body).then(toJSON)
);

const addUpdateUserStarJobCandidate = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.addUpdateUserStarJobCandidate(req.body).then(toJSON)
);
const updateJobStatus = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.updateJobStatus(req.body).then(toJSON)
);
const deleteJobCandidate = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.deleteJobCandidate(req.body).then(toJSON)
);
const addUpdateUserStarJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.addUpdateUserStarJob(req.body).then(toJSON)
);


const copyJob = jsonResponseMiddlewareFactory((req) =>
  req.services.get(ec).jobs.copyJob(req.body).then(toJSON)
);
const fetchJobHiringTeam = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get(ec)
    .jobs.fetchJobHiringTeam(req.params)
    .then(toJSON)
);
module.exports = {
  copyJob,
  createJobDraft,
  fetchPipelineStages,
  copyJobDescriptionTemplate,
  createJobDescriptionTemplate,
  fetchPublicJobTypes,
  fetchJobFromHash,
  fetchPublicDompanyDepartment,
  fetchPublicJobs,
  createExternalCompanyJob,
  prefetchEditJobData,
  updateJob,
  createJob,
  populateDropDowns,
  fetchPaginatedJobsList,
  fetchKanbanBoardData,
  deleteJob,
  fetchJobTeamData,
  addUpdateUserStarJobCandidate,
  addUpdateUserStarJob,
  updateJobStatus,
  fetchCompanyLocations,
  deleteJobCandidate,
  fetchPositionCompanyLocations,
  fetchInternalAppCompanyLocations,
  fetchJobHiringTeam
};

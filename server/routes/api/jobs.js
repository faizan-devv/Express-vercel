const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');
module.exports = (controllers) => {
  const jobsRouter = new Router();

  jobsRouter.get(
    '/fetch-public-jobtypes',
    controllers.jobs.fetchPublicJobTypes
  );
  jobsRouter.post('/fetch-public-jobs', controllers.jobs.fetchPublicJobs);

  jobsRouter.get(
    '/fetch-public-company-department/:companyID',
    controllers.jobs.fetchPublicDompanyDepartment
  );

  jobsRouter.get(
    '/fetch-public-company-department/:companyID',
    controllers.jobs.fetchPublicDompanyDepartment
  );
  jobsRouter.get('/:jobID', controllers.jobs.fetchJobFromHash);
  jobsRouter.get(
    '/fetch-company-locations/:companyID',
    controllers.jobs.fetchCompanyLocations
  );
  jobsRouter.use(verifyJWT);
  jobsRouter.post(
    '/add-update-user-star-job-candidate',
    verifyPermission,
    controllers.jobs.addUpdateUserStarJobCandidate
  );
  jobsRouter.post(
    '/create-job-draft',
    verifyPermission,
    controllers.jobs.createJobDraft
  );
  jobsRouter.post(
    '/fetch-paginated-jobs',
    verifyPermission,
    controllers.jobs.fetchPaginatedJobsList
  );
  jobsRouter.post(
    '/copy-description-template',
    verifyPermission,
    controllers.jobs.copyJobDescriptionTemplate
  );
  jobsRouter.post(
    '/add-update-user-star-job',
    verifyPermission,
    controllers.jobs.addUpdateUserStarJob
  );
  jobsRouter.post(
    '/update-job-status',
    verifyPermission,
    controllers.jobs.updateJobStatus
  );
  jobsRouter.post(
    '/delete-job-candidate',
    verifyPermission,
    controllers.jobs.deleteJobCandidate
  );
  jobsRouter.get(
    '/fetch-company-department/:companyID',
    controllers.jobs.fetchPublicDompanyDepartment
  );

  jobsRouter.get(
    '/fetch-Internal-App-Company-Locations/:companyID',
    controllers.jobs.fetchInternalAppCompanyLocations
  );

  jobsRouter.get(
    '/fetch-position-company-locations/:companyID',
    controllers.jobs.fetchPositionCompanyLocations
  );

  jobsRouter.get(
    '/fetch-pipeline-stages/:jobId',
    controllers.jobs.fetchPipelineStages
  );
  jobsRouter.post('/copy-job', verifyPermission, controllers.jobs.copyJob);
  jobsRouter.post('/create-job', verifyPermission, controllers.jobs.createJob);
  jobsRouter.post(
    '/create-description-template',
    verifyPermission,
    controllers.jobs.createJobDescriptionTemplate
  );

  jobsRouter.post(
    '/create-external-job',
    controllers.jobs.createExternalCompanyJob
  );
  jobsRouter.put('/update-job', verifyPermission, controllers.jobs.updateJob);
  jobsRouter.get(
    '/populate-dropdowns/:companyId',
    verifyPermission,
    controllers.jobs.populateDropDowns
  );

  jobsRouter.post(
    '/fetch-kanban-board/',
    verifyPermission,
    controllers.jobs.fetchKanbanBoardData
  );

  jobsRouter.post('/fetch-team-member/', controllers.jobs.fetchJobTeamData);

  jobsRouter.get(
    '/prefetch-edit-job/:jobId',
    verifyPermission,
    controllers.jobs.prefetchEditJobData
  );
  jobsRouter.delete(
    '/delete-job/:jobId/:userId',
    verifyPermission,
    controllers.jobs.deleteJob
  );
  jobsRouter.get(
    '/fetch-job-hiring-team/:jobId',
    controllers.jobs.fetchJobHiringTeam
  );
  return jobsRouter;
};

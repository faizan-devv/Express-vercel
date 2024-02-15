const getPermissionsByRightName = require('../utils/getPermissionByRights');
const { ForbiddenError } = require('../utils/errorTypes');

const routesMap = {
  //company settings
  //Approvals
  'fetch-public-applicants': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Approvals',
    permission: 'view',
  },
  'manage-applicant': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'Approvals',
    permission: 'modify',
  },
  //general settings
  'fetch-company-data': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'view',
  },
  locations: {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'view',
  },
  'update-details': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'modify',
  },
  'set-primary-location': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'modify',
  },
  'add-location': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'modify',
  },
  'edit-location': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'modify',
  },
  'delete-location': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'General Settings',
    permission: 'modify',
  },
  //integrations
  'fetch-user-thirdparty-apis': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'view',
  },
  'remove-user-api': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'zoom-sign-in-url': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'google-sign-in-url': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'slack-sign-in-url': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'slack-token': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'zoom-token': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  'google-token': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Integrations',
    permission: 'modify',
  },
  //Permissions
  'fetch-roles': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'view',
  },
  'fetch-permissions-grid': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'modify',
  },
  'fetch-role': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'modify',
  },
  'create-role': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'modify',
  },
  'update-role': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'modify',
  },
  'delete-role': {
    method: 'DELETE',
    module: 'Company Settings',
    subModule: 'Permissions',
    permission: 'modify',
  },
  //users
  'fetch-pending-invites': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'view',
  },
  'fetch-users-teams-roles': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'view',
  },
  'send-invitation': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'modify',
  },
  'delete-invitation': {
    method: 'DELETE',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'modify',
  },
  'delete-user': {
    method: 'DELETE',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'modify',
  },
  'update-user-role': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'Users',
    permission: 'modify',
  },
  //teams
  'fetch-teams': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Team Management',
    permission: 'view',
  },
  'fetch-team': {
    method: 'GET',
    module: 'Company Settings',
    subModule: 'Team Management',
    permission: 'view',
  },
  'create-team': {
    method: 'POST',
    module: 'Company Settings',
    subModule: 'Team Management',
    permission: 'modify',
  },
  'update-team': {
    method: 'PUT',
    module: 'Company Settings',
    subModule: 'Team Management',
    permission: 'modify',
  },
  'delete-team': {
    method: 'DELETE',
    module: 'Company Settings',
    subModule: 'Team Management',
    permission: 'modify',
  },
  //Recruitment Preferences
  //Pipelines
  pipeline: {
    method: 'GET',
    module: 'Recruitment Preferences',
    subModule: 'Pipelines',
    permission: 'view',
  },
  'create-pipeline': {
    method: 'POST',
    module: 'Recruitment Preferences',
    subModule: 'Pipelines',
    permission: 'modify',
  },
  'copy-pipeline': {
    method: 'POST',
    module: 'Recruitment Preferences',
    subModule: 'Pipelines',
    permission: 'modify',
  },
  'update-pipeline': {
    method: 'PUT',
    module: 'Recruitment Preferences',
    subModule: 'Pipelines',
    permission: 'modify',
  },
  'delete-pipeline': {
    method: 'DELETE',
    module: 'Recruitment Preferences',
    subModule: 'Pipelines',
    permission: 'modify',
  },
  //Score Cards routes
  'fetch-scorecards': {
    method: 'GET',
    module: 'Recruitment Preferences',
    subModule: 'Score Cards',
    permission: 'view',
  },
  'copy-scorecard': {
    method: 'POST',
    module: 'Recruitment Preferences',
    subModule: 'Score Cards',
    permission: 'modify',
  },
  'update-scorecard': {
    method: 'PUT',
    module: 'Recruitment Preferences',
    subModule: 'Score Cards',
    permission: 'modify',
  },
  'delete-scorecard': {
    method: 'DELETE',
    module: 'Recruitment Preferences',
    subModule: 'Score Cards',
    permission: 'modify',
  },
  //Templates routes
  'create-description-template': {
    method: 'POST',
    module: 'Recruitment Preferences',
    subModule: 'Templates',
    permission: 'modify',
  },
  'copy-description-template': {
    method: 'POST',
    module: 'Recruitment Preferences',
    subModule: 'Templates',
    permission: 'modify',
  },
  //Content Access
  //All Positions
  'fetch-paginated-jobs': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'view',
  },
  'fetch-kanban-board': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'view',
  },
  'add-update-user-star-job': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'add-update-user-star-job-candidate': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'update-job-status': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'delete-job-candidate': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'copy-job': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'create-job': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'create-job-draft': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'update-job': {
    method: 'PUT',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'delete-job': {
    method: 'DELETE',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'prefetch-edit-job': {
    method: 'GET',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  'populate-dropdowns': {
    method: 'GET',
    module: 'Content Access',
    subModule: 'All Positions',
    permission: 'modify',
  },
  //All Pools
  'fetch-paginated-pools': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'view',
  },
  'create-pool': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'modify',
  },
  'copy-pool': {
    method: 'POST',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'modify',
  },
  'update-pool': {
    method: 'PUT',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'modify',
  },
  'delete-pool': {
    method: 'DELETE',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'modify',
  },
  'delete-pool-applicant': {
    method: 'DELETE',
    module: 'Content Access',
    subModule: 'All Pools',
    permission: 'modify',
  },
  //Candidate Management
  //Add Candidate
  'fetch-all-applicants': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Add Candidate',
    permission: 'view',
  },
  'create-applicant': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Add Candidate',
    permission: 'modify',
  },
  'parse-resume': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Add Candidate',
    permission: 'modify',
  },

  'delete-applicants': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Add Candidate',
    permission: 'modify',
  },
  //Candidate Score Card
  'fetch-user-scorecards': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Candidate Score Card',
    permission: 'view',
  },
  'create-user-scorecards': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Candidate Score Card',
    permission: 'modify',
  },
  'update-user-scorecards': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Score Card',
    permission: 'modify',
  },
  //Candidate Details
  'fetch-parsed-applicant': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'view',
  },
  'edit-applicant-personal-info': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'add-edit-candidate-experience': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'add-edit-candidate-education': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'edit-parsed-applicant': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'update-tags': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'update-resume': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'delete-education': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'delete-experience': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'delete-application': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'add-candidate-resume': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  'add-edit-candidate-picture': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Candidate Details',
    permission: 'modify',
  },
  //Notes
  'fetch-notes': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Notes',
    permission: 'view',
  },
  'set-applicant-note': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Notes',
    permission: 'modify',
  },
  'delete-applicant-note': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Notes',
    permission: 'modify',
  },
  //Team Score Card
  'fetch-team-scorecard': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Team Score Card',
    permission: 'view',
  },
  //Discussions
  'fetch-applicant-dicussion': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Discussions',
    permission: 'view',
  },
  'discussion-comment': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Discussions',
    permission: 'modify',
  },
  //Interviews
  'fetch-candidate-meetings': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Interviews',
    permission: 'view',
  },
  'fetch-user-availability': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Interviews',
    permission: 'modify',
  },
  'set-meeting': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Interviews',
    permission: 'modify',
  },
  'update-meeting': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Interviews',
    permission: 'modify',
  },
  'delete-meeting': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Interviews',
    permission: 'modify',
  },
  //Pipeline Stages Movement
  'move-applicant-stage': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Pipeline Stages Movement',
    permission: 'modify',
  },
  'move-applicants': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Pipeline Stages Movement',
    permission: 'modify',
  },
  //Tasks
  'fetch-tasks': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Tasks',
    permission: 'view',
  },
  'create-task': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Tasks',
    permission: 'modify',
  },
  'update-task': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Tasks',
    permission: 'modify',
  },
  'update-taskStatus': {
    method: 'PUT',
    module: 'Candidate Management',
    subModule: 'Tasks',
    permission: 'modify',
  },
  'delete-task': {
    method: 'DELETE',
    module: 'Candidate Management',
    subModule: 'Tasks',
    permission: 'modify',
  },
  //Offers
  'fetch-offers': {
    method: 'GET',
    module: 'Candidate Management',
    subModule: 'Offers',
    permission: 'view',
  },
  'create-offer': {
    method: 'POST',
    module: 'Candidate Management',
    subModule: 'Offers',
    permission: 'modify',
  },
};

const verifyPermission = (req, res, next) => {
  try {
    const { cache, user, url } = req;
    const parsedUrl = url.split('/')[1];
    const doesUserExist = cache.getPermissions()[user.userId];
    if (!doesUserExist) {
      return res.status(401).send('Session Expired Please login again !');
    }
    const userPermissions = doesUserExist['RoleRightsData'];
    const isAllowed = getPermissionsByRightName(
      userPermissions,
      routesMap[parsedUrl].module,
      routesMap[parsedUrl].subModule,
      routesMap[parsedUrl].permission
    );
    if (!isAllowed) {
      throw new ForbiddenError('User is not permitted to access the resource.');
    }
    next();
  } catch (error) {
    res.status(403).send({ success: false, message: error.message });
  }
};

module.exports = {
  verifyPermission,
};

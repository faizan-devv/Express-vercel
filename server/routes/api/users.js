const { Router } = require('express');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');
const { USERS_PATH, FILE_SIZE } = require('../../constants/multerConstants');
const multer = require('multer');
const express = require('express');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, USERS_PATH);
  },
  filename: (req, file, callback) => {
    const { ID } = req.body;
    const fileName =
      'users' + '-' + ID + '-' + Date.now() + '-' + file.originalname;
    callback(null, fileName);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: FILE_SIZE }, // 3MB
});

module.exports = (controllers) => {
  const usersRouter = new Router();
  usersRouter.use(express.static(USERS_PATH));
  usersRouter.get('/fetch-timezones', controllers.users.fetchTimeZones);
  usersRouter.post('/create-user/', controllers.users.createUser);
  usersRouter.post('/send-invitation', controllers.users.sendInvitation);
  usersRouter.post('/verify-code', controllers.users.verifyCode);
  usersRouter.post('/resend-code', controllers.users.resendCode);

  usersRouter.post('/forgot-password', controllers.users.forgotPassword);
  usersRouter.post(
    '/update-forgot-password/',
    controllers.users.updateForgotPassword
  );

  usersRouter.post('/login/', controllers.users.loginUser);

  usersRouter.post('/create-invited-user', controllers.users.createInvitedUser);

  usersRouter.use(verifyJWT);
  usersRouter.get(
    '/fetch-user-thirdparty-apis/:userId',
    verifyPermission,
    controllers.users.fetchUserThirdPartyApis
  );
  usersRouter.put('/remove-user-api', controllers.users.removeThirdPartyApi);
  usersRouter.get(
    '/zoom-sign-in-url',
    verifyPermission,
    controllers.users.zoomSignInUrl
  );
  usersRouter.get(
    '/google-sign-in-url',
    verifyPermission,
    controllers.users.googleSignInUrl
  );
  usersRouter.get(
    '/slack-sign-in-url',
    verifyPermission,
    controllers.users.slackSignInUrl
  );
  usersRouter.post(
    '/slack-token/',
    verifyPermission,
    upload.none(),
    controllers.users.slackToken
  );
  usersRouter.post(
    '/zoom-token/',
    verifyPermission,
    controllers.users.zoomToken
  );
  usersRouter.post(
    '/google-token/',
    verifyPermission,
    controllers.users.googleToken
  );
  usersRouter.get(
    '/fetch-pending-invites/:companyId',
    verifyPermission,
    controllers.users.fetchPendingInvites
  );
  usersRouter.get(
    '/fetch-users-teams-roles/:companyId',
    verifyPermission,
    controllers.users.fetchUserRolesTeams
  );
  usersRouter.post(
    '/send-invitation',
    verifyPermission,
    controllers.users.sendInvitation
  );
  usersRouter.delete(
    '/delete-user/:userId',
    verifyPermission,
    controllers.users.deleteUser
  );
  usersRouter.put(
    '/update-user-role',
    verifyPermission,
    controllers.users.updateUserRole
  );

  usersRouter.put('/update-password/', controllers.users.updatePassword);

  usersRouter.delete(
    '/delete-invitation/:email/:companyId/:userId',
    controllers.users.deleteInvitation
  );
  usersRouter.put('/resend-invitation/', controllers.users.resendInvitation);

  usersRouter.post(
    '/fetch-dashboard-data/',
    controllers.users.fetchDashboardData
  );
  usersRouter.post(
    '/fetch-dashboard-meetings/',
    controllers.users.fetchDashboardMeetings
  );
  usersRouter.get(
    '/fetch-tasks-meetings/:userId/:startDateTime/:endDateTime',
    controllers.users.fetchTasksAndMeetings
  );

  usersRouter.get(
    '/fetch-paginated-users/:offset/:limit/:companyId',
    controllers.users.fetchPaginatedUsersList
  );
  usersRouter.get(
    '/fetch-candidate-meetings/:applicantId/:companyId',
    verifyPermission,
    controllers.users.fetchApplicantMeetings
  );
  usersRouter.get(
    '/fetch-meeting-dropdowns/:companyId',
    controllers.users.populateMeetingDropDowns
  );
  usersRouter.get(
    '/fetch-user-availability/:userId/:date/:companyId',
    verifyPermission,
    controllers.users.showUserAvailability
  );

  usersRouter.get(
    '/fetch-user-notifications/:userId',
    controllers.users.fetchUserNotificationsData
  );
  usersRouter.get(
    '/fetch-user-alerts/:userId',
    controllers.users.fetchUserAlerts
  );
  usersRouter.post(
    '/update-user-notifications',
    controllers.users.updateUserNotifications
  );
  usersRouter.post(
    '/slack-notification',
    controllers.users.sendSlackNotification
  );
  usersRouter.put(
    '/delete-meeting/',
    verifyPermission,
    controllers.users.deleteMeeting
  );
  usersRouter.put(
    '/update-meeting',
    verifyPermission,
    controllers.users.updateMeeting
  );
  usersRouter.post(
    '/set-meeting',
    verifyPermission,
    controllers.users.setMeeting
  );
  usersRouter.post(
    '/create-task',
    verifyPermission,
    controllers.users.createTask
  );
  usersRouter.post(
    '/fetch-tasks',
    verifyPermission,
    controllers.users.fetchTasks
  );
  usersRouter.put(
    '/update-task',
    verifyPermission,
    controllers.users.updateTask
  );
  usersRouter.delete(
    '/delete-task/:taskId/:userId',
    verifyPermission,
    controllers.users.deleteTask
  );
  usersRouter.put(
    '/update-taskStatus',
    verifyPermission,
    controllers.users.updateTaskStatus
  );

  usersRouter.put('/update-user-team', controllers.users.updateUserTeam);
  usersRouter.put('/update-user-alerts', controllers.users.updateUserAlerts);
  usersRouter.put(
    '/update-details',
    upload.single('file'),
    controllers.users.updateDetails
  );

  return usersRouter;
};

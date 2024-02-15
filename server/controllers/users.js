const jsonResponseMiddlewareFactory = require('./jsonResponseMiddlewareFactory');
const toJSON = require('./toJSON');

const createUser = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.createUser(req.body).then(toJSON)
);
const updateUserRole = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateUserRole(req.body).then(toJSON)
);

const sendInvitation = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.sendInvitation(req.body).then(toJSON)
);

const verifyCode = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.verifyCode(req.body).then(toJSON)
);

const resendCode = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.resendCode(req.body).then(toJSON)
);

const forgotPassword = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.forgotPassword(req.body).then(toJSON)
);

const updateForgotPassword = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateForgotPassword(req.body).then(toJSON)
);

const updatePassword = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updatePassword(req.body).then(toJSON)
);

const loginUser = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.loginUser(req.body, req.cache).then(toJSON)
);

const updateDetails = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateDetails(req.body, req.file).then(toJSON)
);

const addInvitedUser = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.addInvitedUser(req.body).then(toJSON)
);

const fetchPaginatedUsersList = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchPaginatedUsersList(req.params).then(toJSON)
);

const createInvitedUser = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.createInvitedUser(req.body).then(toJSON)
);

const fetchPendingInvites = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchPendingInvites(req.params).then(toJSON)
);

const resendInvitation = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.resendInvitation(req.body).then(toJSON)
);

const deleteInvitation = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.deleteInvitation(req.params).then(toJSON)
);

const deleteUser = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.deleteUser(req.params).then(toJSON)
);

const fetchTimeZones = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchTimeZones().then(toJSON)
);

const createTask = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.createTask(req.body).then(toJSON)
);
const fetchTasks = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchTasks(req.body).then(toJSON)
);
const updateTask = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateTask(req.body).then(toJSON)
);
const deleteTask = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.deleteTask(req.params).then(toJSON)
);
const updateTaskStatus = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateTaskStatus(req.body).then(toJSON)
);

const setMeeting = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.setMeeting(req.body).then(toJSON)
);

const updateMeeting = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateMeeting(req.body).then(toJSON)
);
const deleteMeeting = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.deleteMeeting(req.body).then(toJSON)
);

const showUserAvailability = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.showUserAvailability(req.params).then(toJSON)
);

const populateMeetingDropDowns = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.populateMeetingDropDowns(req.params).then(toJSON)
);
const fetchApplicantMeetings = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchApplicantMeetings(req.params).then(toJSON)
);

const updateUserTeam = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateUserTeam(req.body).then(toJSON)
);
const fetchUserRolesTeams = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchUserRolesTeams(req.params).then(toJSON)
);
const fetchDashboardData = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchDashboardData(req.body).then(toJSON)
);
const fetchDashboardMeetings = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchDashboardMeetings(req.body).then(toJSON)
);
const fetchTasksAndMeetings = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchTasksAndMeetings(req.params).then(toJSON)
);
const zoomSignInUrl = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.zoomSignInUrl().then(toJSON)
);
const googleSignInUrl = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.googleSignInUrl().then(toJSON)
);
const slackSignInUrl = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.slackSignInUrl().then(toJSON)
);

const zoomToken = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.zoomToken(req.body).then(toJSON)
);
const googleToken = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.googleToken(req.body).then(toJSON)
);
const slackToken = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.slackToken(req.body).then(toJSON)
);
const fetchUserThirdPartyApis = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchUserThirdPartyApis(req.params).then(toJSON)
);
const removeThirdPartyApi = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.removeThirdPartyApi(req.body).then(toJSON)
);
const sendSlackNotification = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.sendSlackNotification(req.body).then(toJSON)
);
const fetchUserNotificationsData = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get('ec')
    .users.fetchUserNotificationsData(req.params)
    .then(toJSON)
);
const updateUserNotifications = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateUserNotifications(req.body).then(toJSON)
);
const fetchUserAlerts = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.fetchUserAlerts(req.params).then(toJSON)
);
const updateUserAlerts = jsonResponseMiddlewareFactory((req) =>
  req.services.get('ec').users.updateUserAlerts(req.body).then(toJSON)
);
const taskDueScheduledNotifications = jsonResponseMiddlewareFactory((req) =>
  req.services
    .get('ec')
    .users.taskDueScheduledNotifications(req.body)
    .then(toJSON)
);
module.exports = {
  taskDueScheduledNotifications,
  updateUserAlerts,
  fetchUserAlerts,
  updateUserNotifications,
  fetchUserNotificationsData,
  removeThirdPartyApi,
  fetchUserThirdPartyApis,
  sendSlackNotification,
  slackToken,
  zoomToken,
  googleToken,
  slackSignInUrl,
  googleSignInUrl,
  zoomSignInUrl,
  fetchTasksAndMeetings,
  deleteMeeting,
  updateMeeting,
  fetchDashboardData,
  fetchDashboardMeetings,
  fetchUserRolesTeams,
  updateUserTeam,
  fetchApplicantMeetings,
  populateMeetingDropDowns,
  showUserAvailability,
  setMeeting,
  updateTaskStatus,
  updateTask,
  fetchTasks,
  createTask,
  fetchTimeZones,
  deleteUser,
  deleteInvitation,
  resendInvitation,
  fetchPendingInvites,
  createInvitedUser,
  fetchPaginatedUsersList,
  createUser,
  sendInvitation,
  verifyCode,
  resendCode,
  forgotPassword,
  updateForgotPassword,
  updatePassword,
  loginUser,
  updateDetails,
  addInvitedUser,
  updateUserRole,
  deleteTask,
};

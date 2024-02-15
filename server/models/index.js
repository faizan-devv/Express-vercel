const relationships = require('./relationships');
const users = require('./users');
const companies = require('./companies');
const countries = require('./countries');
const states = require('./states');
const cities = require('./cities');
const timezones = require('./timezones');
const candidateEducation = require('./candidateEducation');
const candidateWorkingExperience = require('./candidateWorkingExperience');
const companyLocations = require('./companyLocations');
const currencies = require('./currencies');
const employmentTypes = require('./employmentTypes');
const jobTime = require('./jobTime');
const jobTitles = require('./jobTitles');
const jobTypes = require('./jobTypes');
const jobs = require('./jobs');
const roles = require('./roles');
const pipelines = require('./pipelines');
const stages = require('./stages');
const jobTags = require('./jobTags');
const jobHiringTeam = require('./jobHiringTeam');
const tags = require('./tags');
const applicants = require('./applicants');
const applications = require('./applications');
const applicationsStatus = require('./applicationStatus');
const companyTypes = require('./companyTypes');
const jobExperienceLevel = require('./jobExperienceLevel');
const jobRequiredEducation = require('./jobRequiredEducation');
const education = require('./education');
const department = require('./department');
const pools = require('./pools');
const poolTags = require('./poolTags');
const jobDescriptionTemplates = require('./jobDescriptionTemplates');
const teams = require('./teams');
const teamMembers = require('./teamMembers');
const scoreCards = require('./scoreCards');
const sections = require('./sections');
const sectionItems = require('./sectionItems');
const candidateTags = require('./candidateTags');
const jobStatuses = require('./jobStatuses');
const salaryPeriods = require('./salaryPeriods');
const jobPublishStatuses = require('./jobpublishStatuses');
const categories = require('./categories');
const candidatePools = require('./candidatePools');
const genders = require('./genders');
const candidateOverallScores = require('./candidateOverallScores');
const candidateScores = require('./candidateScores');
const scoreCardAnswers = require('./scoreCardAnswers');
const tasks = require('./tasks');
const taskAssignees = require('./taskAssignees');
const candidateNotes = require('./candidateNotes');
const candidateDocuments = require('./candidateDocuments');
const candidateActivities = require('./candidateActivities');
const candidateDiscussions = require('./candidateDiscussions');
const meetingStatuses = require('./meetingStatuses');
const meetingTeamMembers = require('./meetingTeamMembers');
const meetingTypes = require('./meetingTypes');
const durations = require('./durations');
const meetings = require('./meetings');
const rights = require('./rights');
const modules = require('./modules');
const subModules = require('./subModules');
const rolesSubModulesRights = require('./rolesSubModulesRights');
const offerStatuses = require('./offerStatuses');
const candidateOffers = require('./candidateOffers');
const documentTypes = require('./documentTypes');
const tasksStatuses = require('./tasksStatuses');
const applicantStatuses = require('./applicantStatuses');
const thirdPartyAPITokens = require('./thirdPartyAPITokens');
const meetingOptions = require('./meetingOptions');
const benefitsPlans = require('./benefitsPlans');
const recurrences = require('./recurrences');
const pricingPlans = require('./pricingPlans');
const cardTypes = require('./cardTypes');
const companyCards = require('./companyCards');
const companyPaymentHistory = require('./companyPaymentHistory');
const companyPricingPlans = require('./companyPricingPlans');
const feedBackQuestions = require('./feedBackQuestions');
const feedBackQuestionsAnswers = require('./feedBackQuestionsAnswers');
const feedBackQuestionType = require('./feedBackQuestionType');
const thirdPartyAPIs = require('./thirdPartyAPIs');
const usersJobsStarCandidates = require('./usersJobsStarCandidates');
const userStarJobs = require('./UserStarJobs');
const notificationCategories = require('./notificationCategories');
const notifications = require('./notifications');
const userNotifications = require('./userNotifications');
const userNotificationSettings = require('./userNotificationSettings');
const taskActivities = require('./taskActivities')
const discussionMentionedUsers = require('./discussionMentionedUsers')

module.exports = (sequelize) => {
  let models = {
    users: users(sequelize),
    companies: companies(sequelize),
    countries: countries(sequelize),
    states: states(sequelize),
    cities: cities(sequelize),
    timezones: timezones(sequelize),
    candidateEducation: candidateEducation(sequelize),
    candidateWorkingExperience: candidateWorkingExperience(sequelize),
    companyLocations: companyLocations(sequelize),
    currencies: currencies(sequelize),
    employmentTypes: employmentTypes(sequelize),
    jobTime: jobTime(sequelize),
    jobTitles: jobTitles(sequelize),
    jobTypes: jobTypes(sequelize),
    jobs: jobs(sequelize),
    roles: roles(sequelize),
    pipelines: pipelines(sequelize),
    stages: stages(sequelize),
    jobTags: jobTags(sequelize),
    poolTags: poolTags(sequelize),
    jobHiringTeam: jobHiringTeam(sequelize),
    tags: tags(sequelize),
    applicants: applicants(sequelize),
    applications: applications(sequelize),
    applicationsStatus: applicationsStatus(sequelize),
    companyTypes: companyTypes(sequelize),
    jobExperienceLevel: jobExperienceLevel(sequelize),
    jobRequiredEducation: jobRequiredEducation(sequelize),
    education: education(sequelize),
    department: department(sequelize),
    pools: pools(sequelize),
    jobDescriptionTemplates: jobDescriptionTemplates(sequelize),
    teams: teams(sequelize),
    teamMembers: teamMembers(sequelize),
    scoreCards: scoreCards(sequelize),
    sections: sections(sequelize),
    sectionItems: sectionItems(sequelize),
    candidateTags: candidateTags(sequelize),
    jobStatuses: jobStatuses(sequelize),
    salaryPeriods: salaryPeriods(sequelize),
    jobPublishStatuses: jobPublishStatuses(sequelize),
    categories: categories(sequelize),
    candidatePools: candidatePools(sequelize),
    genders: genders(sequelize),
    candidateOverallScores: candidateOverallScores(sequelize),
    candidateScores: candidateScores(sequelize),
    scoreCardAnswers: scoreCardAnswers(sequelize),
    tasks: tasks(sequelize),
    taskAssignees: taskAssignees(sequelize),
    candidateNotes: candidateNotes(sequelize),
    candidateDocuments: candidateDocuments(sequelize),
    candidateActivities: candidateActivities(sequelize),
    candidateDiscussions: candidateDiscussions(sequelize),
    meetingStatuses: meetingStatuses(sequelize),
    meetingTeamMembers: meetingTeamMembers(sequelize),
    meetingTypes: meetingTypes(sequelize),
    durations: durations(sequelize),
    meetings: meetings(sequelize),
    rights: rights(sequelize),
    modules: modules(sequelize),
    subModules: subModules(sequelize),
    rolesSubModulesRights: rolesSubModulesRights(sequelize),
    offerStatuses: offerStatuses(sequelize),
    candidateOffers: candidateOffers(sequelize),
    documentTypes: documentTypes(sequelize),
    tasksStatuses: tasksStatuses(sequelize),
    applicantStatuses: applicantStatuses(sequelize),
    thirdPartyAPITokens: thirdPartyAPITokens(sequelize),
    meetingOptions: meetingOptions(sequelize),
    benefitsPlans: benefitsPlans(sequelize),
    pricingPlans: pricingPlans(sequelize),
    recurrences: recurrences(sequelize),
    cardTypes: cardTypes(sequelize),
    companyCards: companyCards(sequelize),
    companyPaymentHistory: companyPaymentHistory(sequelize),
    companyPricingPlans: companyPricingPlans(sequelize),
    feedBackQuestions: feedBackQuestions(sequelize),
    feedBackQuestionsAnswers: feedBackQuestionsAnswers(sequelize),
    feedBackQuestionType: feedBackQuestionType(sequelize),
    thirdPartyAPIs: thirdPartyAPIs(sequelize),
    usersJobsStarCandidates: usersJobsStarCandidates(sequelize),
    userStarJobs: userStarJobs(sequelize),
    notificationCategories: notificationCategories(sequelize),
    notifications: notifications(sequelize),
    userNotifications: userNotifications(sequelize),
    userNotificationSettings: userNotificationSettings(sequelize),
    taskActivities: taskActivities(sequelize),
    discussionMentionedUsers: discussionMentionedUsers(sequelize)
  };

  return relationships(models);
};

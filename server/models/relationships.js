module.exports = (models) => {
  models.notificationCategories.hasMany(models.userNotifications, {
    foreignKey: 'NotificationCategoryID',
    sourceKey: 'ID',
  });
  models.userNotifications.belongsTo(models.notificationCategories, {
    foreignKey: 'NotificationCategoryID',
  });
  models.notifications.hasMany(models.userNotificationSettings, {
    foreignKey: 'NotificationID',
    sourceKey: 'ID',
  });
  models.userNotificationSettings.belongsTo(models.notifications, {
    foreignKey: 'NotificationID',
  });
  models.users.hasMany(models.userNotificationSettings, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.userNotificationSettings.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.users.hasMany(models.userNotifications, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.userNotifications.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.users.hasMany(models.userNotifications, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.userNotifications.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.notificationCategories.hasMany(models.notifications, {
    foreignKey: 'NotificationCategoryID',
    sourceKey: 'ID',
  });
  models.notifications.belongsTo(models.notificationCategories, {
    foreignKey: 'NotificationCategoryID',
  });
  models.thirdPartyAPIs.hasMany(models.thirdPartyAPITokens, {
    foreignKey: 'ThirdPartyApiID',
    sourceKey: 'ID',
  });
  models.thirdPartyAPITokens.belongsTo(models.thirdPartyAPIs, {
    foreignKey: 'ThirdPartyApiID',
  });
  models.cardTypes.hasMany(models.companyCards, {
    foreignKey: 'CardTypeID',
    sourceKey: 'ID',
  });
  models.companyCards.belongsTo(models.cardTypes, {
    foreignKey: 'CardTypeID',
  });
  models.pricingPlans.hasMany(models.companyPricingPlans, {
    foreignKey: 'PricingPlanID',
    sourceKey: 'ID',
  });
  models.companyPricingPlans.belongsTo(models.pricingPlans, {
    foreignKey: 'PricingPlanID',
  });
  models.companies.hasMany(models.companyPricingPlans, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.companyPricingPlans.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.companyPaymentHistory, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.companyPaymentHistory.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.companyCards, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.companyCards.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.recurrences.hasMany(models.pricingPlans, {
    foreignKey: 'RecurrenceID',
    sourceKey: 'ID',
  });
  models.pricingPlans.belongsTo(models.recurrences, {
    foreignKey: 'RecurrenceID',
  });
  models.currencies.hasMany(models.pricingPlans, {
    foreignKey: 'CurrencyID',
    sourceKey: 'ID',
  });
  models.pricingPlans.belongsTo(models.currencies, {
    foreignKey: 'CurrencyID',
  });
  models.pricingPlans.hasMany(models.benefitsPlans, {
    foreignKey: 'PricingPlansID',
    sourceKey: 'ID',
  });
  models.benefitsPlans.belongsTo(models.pricingPlans, {
    foreignKey: 'PricingPlansID',
  });
  models.applicantStatuses.hasMany(models.applications, {
    foreignKey: 'ApplicantStatusID',
    sourceKey: 'ID',
  });
  models.applications.belongsTo(models.applicantStatuses, {
    foreignKey: 'ApplicantStatusID',
  });
  models.candidateDocuments.hasMany(models.candidateOffers, {
    foreignKey: 'CandidateDocumentID',
    sourceKey: 'ID',
  });
  models.candidateOffers.belongsTo(models.candidateDocuments, {
    foreignKey: 'CandidateDocumentID',
  });
  models.tasksStatuses.hasMany(models.tasks, {
    foreignKey: 'TaskStatusID',
    sourceKey: 'ID',
  });
  models.tasks.belongsTo(models.tasksStatuses, {
    foreignKey: 'TaskStatusID',
  });
  models.companies.hasMany(models.department, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.department.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.users.hasMany(models.candidateDocuments, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.candidateDocuments.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.applicants.hasMany(models.candidateTags, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateTags.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.tags.hasMany(models.candidateTags, {
    foreignKey: 'TagID',
    sourceKey: 'ID',
  });
  models.candidateTags.belongsTo(models.tags, {
    foreignKey: 'TagID',
  });
  models.documentTypes.hasMany(models.candidateDocuments, {
    foreignKey: 'DocumentTypeID',
    sourceKey: 'ID',
  });
  models.candidateDocuments.belongsTo(models.documentTypes, {
    foreignKey: 'DocumentTypeID',
  });
  models.applicants.hasMany(models.candidateOffers, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateOffers.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.offerStatuses.hasMany(models.candidateOffers, {
    foreignKey: 'OfferStatusID',
    sourceKey: 'ID',
  });
  models.candidateOffers.belongsTo(models.offerStatuses, {
    foreignKey: 'OfferStatusID',
  });
  models.subModules.hasMany(models.rolesSubModulesRights, {
    foreignKey: 'SubModuleID',
    sourceKey: 'ID',
  });
  models.rolesSubModulesRights.belongsTo(models.subModules, {
    foreignKey: 'SubModuleID',
  });
  models.rights.hasMany(models.rolesSubModulesRights, {
    foreignKey: 'RightsID',
    sourceKey: 'ID',
  });
  models.rolesSubModulesRights.belongsTo(models.rights, {
    foreignKey: 'RightsID',
  });
  models.roles.hasMany(models.rolesSubModulesRights, {
    foreignKey: 'RoleID',
    sourceKey: 'ID',
  });
  models.rolesSubModulesRights.belongsTo(models.roles, {
    foreignKey: 'RoleID',
  });
  models.modules.hasMany(models.subModules, {
    foreignKey: 'ModuleID',
    sourceKey: 'ID',
  });
  models.subModules.belongsTo(models.modules, {
    foreignKey: 'ModuleID',
  });
  models.roles.hasMany(models.users, {
    foreignKey: 'RoleID',
    sourceKey: 'ID',
  });
  models.users.belongsTo(models.roles, {
    foreignKey: 'RoleID',
  });
  models.users.hasMany(models.users, {
    foreignKey: 'InvitedUserID',
    sourceKey: 'ID',
  });
  models.users.belongsTo(models.users, {
    as: 'InvitedByUser',
    foreignKey: 'InvitedUserID',
  });
  models.companyLocations.hasMany(models.meetings, {
    foreignKey: 'CompanyLocationID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.companyLocations, {
    foreignKey: 'CompanyLocationID',
  });
  models.meetings.hasMany(models.meetingTeamMembers, {
    foreignKey: 'MeetingID',
    sourceKey: 'ID',
  });
  models.meetingTeamMembers.belongsTo(models.meetings, {
    foreignKey: 'MeetingID',
  });
  models.users.hasMany(models.meetingTeamMembers, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.meetingTeamMembers.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.applicants.hasMany(models.meetings, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.timezones.hasMany(models.meetings, {
    foreignKey: 'TimeZoneID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.timezones, {
    foreignKey: 'TimeZoneID',
  });
  models.meetingStatuses.hasMany(models.meetings, {
    foreignKey: 'MeetingStatusID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.meetingStatuses, {
    foreignKey: 'MeetingStatusID',
  });
  models.meetingTypes.hasMany(models.meetings, {
    foreignKey: 'MeetingTypeID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.meetingTypes, {
    foreignKey: 'MeetingTypeID',
  });
  models.durations.hasMany(models.meetings, {
    foreignKey: 'DurationID',
    sourceKey: 'ID',
  });
  models.meetings.belongsTo(models.durations, {
    foreignKey: 'DurationID',
  });
  models.users.hasMany(models.candidateNotes, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.candidateNotes.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.applicants.hasMany(models.candidateActivities, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.offerStatuses.hasMany(models.candidateActivities, {
    foreignKey: 'OfferStatusID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.offerStatuses, {
    foreignKey: 'OfferStatusID',
  });
  models.jobs.hasMany(models.candidateActivities, {
    foreignKey: 'JobFromID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.jobs, {
    as: 'JobFrom',
    foreignKey: 'JobFromID',
  });
  models.jobs.hasMany(models.candidateActivities, {
    foreignKey: 'JobToID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.jobs, {
    as: 'JobTo',
    foreignKey: 'JobToID',
  });

  models.pools.hasMany(models.candidateActivities, {
    foreignKey: 'PoolToID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.pools, {
    as: 'PoolTo',
    foreignKey: 'PoolToID',
  });
  models.users.hasMany(models.pools, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.pools.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.pools.hasMany(models.candidateActivities, {
    foreignKey: 'PoolFromID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.pools, {
    as: 'PoolFrom',
    foreignKey: 'PoolFromID',
  });

  models.stages.hasMany(models.candidateActivities, {
    foreignKey: 'StageFromID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.stages, {
    as: 'StageFrom',
    foreignKey: 'StageFromID',
  });
  models.stages.hasMany(models.candidateActivities, {
    foreignKey: 'StageToID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.stages, {
    as: 'StageTo',
    foreignKey: 'StageToID',
  });

  models.applicants.hasMany(models.candidateActivities, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });

  models.users.hasMany(models.candidateActivities, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.candidateActivities.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.candidateDiscussions.hasMany(models.discussionMentionedUsers, {
    foreignKey: 'CandidateDiscussionsID',
    sourceKey: 'ID',
  });
  models.discussionMentionedUsers.belongsTo(models.candidateDiscussions, {
    foreignKey: 'CreatedBy',
  });

  models.users.hasMany(models.discussionMentionedUsers, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.discussionMentionedUsers.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
 
  models.candidateDiscussions.belongsTo(models.candidateDiscussions, {
    foreignKey: 'ReplyToDiscussionID',
    as: 'ReplyDiscussion',
  });

  models.users.hasMany(models.candidateDiscussions, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.candidateDiscussions.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });

  models.applicants.hasMany(models.candidateNotes, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateNotes.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.applicants.hasMany(models.candidateDocuments, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateDocuments.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.users.hasMany(models.applicants, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.users.hasMany(models.tasks, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.tasks.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });

  models.users.hasMany(models.tasks, {
    foreignKey: 'ModifiedBy',
    sourceKey: 'ID',
  });
  models.tasks.belongsTo(models.users, {
    as: 'ModifiedByUser',
    foreignKey: 'ModifiedBy',
  });

  models.tasks.hasMany(models.taskAssignees, {
    foreignKey: 'TaskID',
    sourceKey: 'ID',
  });
  models.taskAssignees.belongsTo(models.tasks, {
    foreignKey: 'TaskID',
  });
  models.users.hasMany(models.taskAssignees, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.taskAssignees.belongsTo(models.users, {
    foreignKey: 'UserID',
  });
  models.applicants.hasMany(models.tasks, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.tasks.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.jobs.hasMany(models.tasks, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.tasks.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });
  models.tasks.hasMany(models.taskActivities, {
    foreignKey: 'TaskID',
    sourceKey: 'ID'
  })
  models.taskActivities.belongsTo(models.tasks, {
    foreignKey: 'TaskID',
  });
  models.users.hasMany(models.taskActivities, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID'
  })
  models.taskActivities.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.states.hasMany(models.cities, {
    foreignKey: 'StateID',
    sourceKey: 'ID',
  });

  models.cities.belongsTo(models.states, {
    foreignKey: 'StateID',
  });

  models.countries.hasMany(models.states, {
    foreignKey: 'CountryID',
    sourceKey: 'ID',
  });

  models.states.belongsTo(models.countries, {
    foreignKey: 'CountryID',
  });

  models.users.hasMany(models.candidateScores, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.candidateScores.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });
  models.applications.hasMany(models.candidateScores, {
    foreignKey: 'ApplicationID',
    sourceKey: 'ID',
  });
  models.candidateScores.belongsTo(models.applications, {
    foreignKey: 'ApplicationID',
  });
  models.scoreCardAnswers.hasMany(models.candidateScores, {
    foreignKey: 'AnswerID',
    sourceKey: 'ID',
  });
  models.candidateScores.belongsTo(models.scoreCardAnswers, {
    foreignKey: 'AnswerID',
  });
  models.sectionItems.hasMany(models.candidateScores, {
    foreignKey: 'SectionItemID',
    sourceKey: 'ID',
  });
  models.candidateScores.belongsTo(models.sectionItems, {
    foreignKey: 'SectionItemID',
  });

  models.users.hasMany(models.candidateOverallScores, {
    foreignKey: 'CreatedBy',
    sourceKey: 'ID',
  });
  models.candidateOverallScores.belongsTo(models.users, {
    foreignKey: 'CreatedBy',
  });

  models.applicants.hasMany(models.candidateOverallScores, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateOverallScores.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.scoreCardAnswers.hasMany(models.candidateOverallScores, {
    foreignKey: 'AnswerID',
    sourceKey: 'ID',
  });
  models.candidateOverallScores.belongsTo(models.scoreCardAnswers, {
    foreignKey: 'AnswerID',
  }); 
  models.companies.hasMany(models.users, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.users.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.teams, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.teams.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });

  models.timezones.hasMany(models.companies, {
    foreignKey: 'TimeZoneID',
    sourceKey: 'ID',
  });
  models.companies.belongsTo(models.timezones, {
    foreignKey: 'TimeZoneID',
  });
  models.companyTypes.hasMany(models.companies, {
    foreignKey: 'CompanyTypeID',
    sourceKey: 'ID',
  });
  models.companies.belongsTo(models.companyTypes, {
    foreignKey: 'CompanyTypeID',
  });
  models.companies.hasMany(models.jobs, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.tags, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.tags.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.pools, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.pools.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.pipelines.hasMany(models.pools, {
    foreignKey: 'PipelineID',
    sourceKey: 'ID',
  });
  models.pools.belongsTo(models.pipelines, {
    foreignKey: 'PipelineID',
  });
  models.categories.hasMany(models.pools, {
    foreignKey: 'CategoryID',
    sourceKey: 'ID',
  });
  models.pools.belongsTo(models.categories, {
    foreignKey: 'CategoryID',
  });
  models.employmentTypes.hasMany(models.candidateWorkingExperience, {
    foreignKey: 'EmploymentTypeID',
    sourceKey: 'ID',
  });
  models.candidateWorkingExperience.belongsTo(models.employmentTypes, {
    foreignKey: 'EmploymentTypeID',
  });
  models.jobTypes.hasMany(models.jobs, {
    foreignKey: 'JobTypeID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.jobTypes, {
    foreignKey: 'JobTypeID',
  });

  models.companies.hasMany(models.applicants, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });

  models.employmentTypes.hasMany(models.jobs, {
    foreignKey: 'EmploymentTypeID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.employmentTypes, {
    foreignKey: 'EmploymentTypeID',
  });

  models.genders.hasMany(models.applicants, {
    foreignKey: 'GenderID',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.genders, {
    foreignKey: 'GenderID',
  });

  models.department.hasMany(models.jobs, {
    foreignKey: 'DepartmentID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.department, {
    foreignKey: 'DepartmentID',
  });

  models.salaryPeriods.hasMany(models.jobs, {
    foreignKey: 'SalaryPeriodID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.salaryPeriods, {
    foreignKey: 'SalaryPeriodID',
  });

  models.companyLocations.hasMany(models.jobs, {
    foreignKey: 'LocationID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.companyLocations, {
    foreignKey: 'LocationID',
  });

  models.countries.hasMany(models.candidateWorkingExperience, {
    foreignKey: 'CountryID',
    sourceKey: 'ID',
  });
  models.candidateWorkingExperience.belongsTo(models.countries, {
    foreignKey: 'CountryID',
  });
  models.cities.hasMany(models.candidateWorkingExperience, {
    foreignKey: 'CityID',
    sourceKey: 'ID',
  });
  models.candidateWorkingExperience.belongsTo(models.cities, {
    foreignKey: 'CityID',
  });
  models.states.hasMany(models.candidateWorkingExperience, {
    foreignKey: 'StateID',
    sourceKey: 'ID',
  });
  models.candidateWorkingExperience.belongsTo(models.states, {
    foreignKey: 'StateID',
  });

  models.countries.hasMany(models.applicants, {
    foreignKey: 'CountryID',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.countries, {
    foreignKey: 'CountryID',
  });
  models.states.hasMany(models.applicants, {
    foreignKey: 'StateID',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.states, {
    foreignKey: 'StateID',
  });
  models.cities.hasMany(models.applicants, {
    foreignKey: 'CityID',
    sourceKey: 'ID',
  });
  models.applicants.belongsTo(models.cities, {
    foreignKey: 'CityID',
  });

  models.countries.hasMany(models.companyLocations, {
    foreignKey: 'CountryID',
    sourceKey: 'ID',
  });
  models.companyLocations.belongsTo(models.countries, {
    foreignKey: 'CountryID',
  });
  models.states.hasMany(models.companyLocations, {
    foreignKey: 'StateID',
    sourceKey: 'ID',
  });
  models.companyLocations.belongsTo(models.states, {
    foreignKey: 'StateID',
  });
  models.cities.hasMany(models.companyLocations, {
    foreignKey: 'CityID',
    sourceKey: 'ID',
  });
  models.companyLocations.belongsTo(models.cities, {
    foreignKey: 'CityID',
  });
  models.applicants.hasMany(models.candidateEducation, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateEducation.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.applicants.hasMany(models.candidateWorkingExperience, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidateWorkingExperience.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.applicants.hasMany(models.candidatePools, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.candidatePools.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });
  models.pools.hasMany(models.candidatePools, {
    foreignKey: 'PoolID',
    sourceKey: 'ID',
  });
  models.candidatePools.belongsTo(models.pools, {
    foreignKey: 'PoolID',
  });

  models.currencies.hasMany(models.jobs, {
    foreignKey: 'CurrencyID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.currencies, {
    foreignKey: 'CurrencyID',
  });
  models.scoreCards.hasMany(models.jobs, {
    foreignKey: 'ScoreCardID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.scoreCards, {
    foreignKey: 'ScoreCardID',
  });
  models.jobStatuses.hasMany(models.jobs, {
    foreignKey: 'JobStatusID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.jobStatuses, {
    foreignKey: 'JobStatusID',
  });
  models.jobPublishStatuses.hasMany(models.jobs, {
    foreignKey: 'PublishStatusID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.jobPublishStatuses, {
    foreignKey: 'PublishStatusID',
  });
  models.department.hasMany(models.jobs, {
    foreignKey: 'DepartmentID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.department, {
    foreignKey: 'DepartmentID',
  });

  models.pipelines.hasMany(models.jobs, {
    foreignKey: 'PipelineID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.pipelines, {
    foreignKey: 'PipelineID',
  });

  models.pipelines.hasMany(models.stages, {
    foreignKey: 'PipelineID',
    sourceKey: 'ID',
  });
  models.stages.belongsTo(models.pipelines, {
    foreignKey: 'PipelineID',
  });

  models.stages.hasMany(models.applications, {
    foreignKey: 'StageID',
    sourceKey: 'ID',
  });
  models.applications.belongsTo(models.stages, {
    foreignKey: 'StageID',
  });
  models.stages.hasMany(models.candidatePools, {
    foreignKey: 'StageID',
    sourceKey: 'ID',
  });
  models.candidatePools.belongsTo(models.stages, {
    foreignKey: 'StageID',
  });

  models.companies.hasMany(models.categories, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.categories.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.jobDescriptionTemplates, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.jobDescriptionTemplates.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.companies.hasMany(models.roles, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.roles.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });

  models.companies.hasMany(models.scoreCards, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.scoreCards.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.scoreCards.hasMany(models.sections, {
    foreignKey: 'ScoreCardID',
    sourceKey: 'ID',
  });
  models.sections.belongsTo(models.scoreCards, {
    foreignKey: 'ScoreCardID',
  });
  models.sections.hasMany(models.sectionItems, {
    foreignKey: 'SectionID',
    sourceKey: 'ID',
  });
  models.sectionItems.belongsTo(models.sections, {
    foreignKey: 'SectionID',
  });

  models.jobs.hasMany(models.jobTags, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.jobTags.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });
  models.teams.hasMany(models.teamMembers, {
    foreignKey: 'TeamID',
    sourceKey: 'ID',
  });
  models.teamMembers.belongsTo(models.teams, {
    foreignKey: 'TeamID',
  });
  models.users.hasMany(models.teamMembers, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.teamMembers.belongsTo(models.users, {
    foreignKey: 'UserID',
  });

  models.pools.hasMany(models.poolTags, {
    foreignKey: 'PoolID',
    sourceKey: 'ID',
  });
  models.poolTags.belongsTo(models.pools, {
    foreignKey: 'PoolID',
  });

  models.jobs.hasMany(models.jobHiringTeam, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.jobHiringTeam.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });

  models.jobs.hasMany(models.usersJobsStarCandidates, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.usersJobsStarCandidates.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });

  models.users.hasMany(models.usersJobsStarCandidates, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.usersJobsStarCandidates.belongsTo(models.users, {
    foreignKey: 'UserID',
  });

  models.applications.hasMany(models.usersJobsStarCandidates, {
    foreignKey: 'ApplicationID',
    sourceKey: 'ID',
  });
  models.usersJobsStarCandidates.belongsTo(models.applications, {
    foreignKey: 'ApplicationID',
  });

  models.jobs.hasMany(models.userStarJobs, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.userStarJobs.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });

  models.users.hasMany(models.userStarJobs, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.userStarJobs.belongsTo(models.users, {
    foreignKey: 'UserID',
  });

  models.users.hasMany(models.jobHiringTeam, {
    foreignKey: 'UserID',
    sourceKey: 'ID',
  });
  models.jobHiringTeam.belongsTo(models.users, {
    foreignKey: 'UserID',
  });

  models.teams.hasMany(models.jobHiringTeam, {
    foreignKey: 'TeamID',
    sourceKey: 'ID',
  });
  models.jobHiringTeam.belongsTo(models.teams, {
    foreignKey: 'TeamID',
  });

  models.roles.hasMany(models.jobHiringTeam, {
    foreignKey: 'RoleID',
    sourceKey: 'ID',
  });
  models.jobHiringTeam.belongsTo(models.roles, {
    foreignKey: 'RoleID',
  });

  models.tags.hasMany(models.jobTags, {
    foreignKey: 'TagID',
    sourceKey: 'ID',
  });
  models.jobTags.belongsTo(models.tags, {
    foreignKey: 'TagID',
  });

  models.tags.hasMany(models.poolTags, {
    foreignKey: 'TagID',
    sourceKey: 'ID',
  });
  models.poolTags.belongsTo(models.tags, {
    foreignKey: 'TagID',
  });

  models.jobs.hasMany(models.applications, {
    foreignKey: 'JobID',
    sourceKey: 'ID',
  });
  models.applications.belongsTo(models.jobs, {
    foreignKey: 'JobID',
  });

  models.applicants.hasMany(models.applications, {
    foreignKey: 'ApplicantID',
    sourceKey: 'ID',
  });
  models.applications.belongsTo(models.applicants, {
    foreignKey: 'ApplicantID',
  });

  models.jobExperienceLevel.hasMany(models.jobs, {
    foreignKey: 'MinimumExperienceID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.jobExperienceLevel, {
    foreignKey: 'MinimumExperienceID',
  });

  models.education.hasMany(models.jobs, {
    foreignKey: 'MinimumEducationID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.education, {
    foreignKey: 'MinimumEducationID',
  });

  models.jobTime.hasMany(models.jobs, {
    foreignKey: 'ShiftTime',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.jobTime, {
    foreignKey: 'ShiftTime',
  });

  models.companies.hasMany(models.pipelines, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.pipelines.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });
  models.education.hasMany(models.jobs, {
    foreignKey: 'MinimumEducationID',
    sourceKey: 'ID',
  });
  models.jobs.belongsTo(models.education, {
    foreignKey: 'MinimumEducationID',
  });
  models.companies.hasMany(models.companyLocations, {
    foreignKey: 'CompanyID',
    sourceKey: 'ID',
  });
  models.companyLocations.belongsTo(models.companies, {
    foreignKey: 'CompanyID',
  });

  models.feedBackQuestionType.hasMany(models.feedBackQuestions, {
    foreignKey: 'FeedBackQuestionTypeID',
    sourceKey: 'ID',
  });
  models.feedBackQuestions.belongsTo(models.feedBackQuestionType, {
    foreignKey: 'FeedBackQuestionTypeID',
  });

  models.feedBackQuestions.hasMany(models.feedBackQuestions, {
    foreignKey: 'ParentFeedBackQuestionID',
    sourceKey: 'ID',
    as: 'SubQuestions',
  });
  models.feedBackQuestions.belongsTo(models.feedBackQuestions, {
    foreignKey: 'ParentFeedBackQuestionID',
  });

  models.feedBackQuestions.hasMany(models.feedBackQuestionsAnswers, {
    foreignKey: 'QuestionID',
    sourceKey: 'ID',
  });
  models.feedBackQuestionsAnswers.belongsTo(models.feedBackQuestions, {
    foreignKey: 'QuestionID',
  });

  return models;
};

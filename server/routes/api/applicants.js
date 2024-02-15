const { Router } = require('express');
const multer = require('multer');
const {
  DOCUMENTS_PATH,
  FILE_SIZE,
} = require('../../constants/multerConstants');
const { verifyJWT } = require('../../middleware/auth');
const { verifyPermission } = require('../../middleware/permissions');
const express = require('express');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, DOCUMENTS_PATH);
  },
  filename: (req, file, callback) => {
    let pathInitial = '';
    if (file.fieldname === 'document') {
      pathInitial = 'applicants';
    } else if (file.fieldname === 'profilePicture') {
      pathInitial = 'applicantsProfilePic';
    }
    const { fullName } = req.body;
    const fileName = pathInitial + '-' + Date.now() + '-' + file.originalname;
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
    const fileExtension = file?.originalname.split('.')[1];
    callback(null, true);
  },
});

module.exports = (controllers) => {
  const applicantsRouter = new Router();
  applicantsRouter.use(express.static(DOCUMENTS_PATH));
  applicantsRouter.get(
    '/fetch-offer-statuses/',
    controllers.applicants.fetchOfferStatuses
  );
  applicantsRouter.get(
    '/fetch-offer/:offerHash',
    controllers.applicants.fetchOffer
  );
  applicantsRouter.post(
    '/create-public-applicant',
    upload.fields([
      { name: 'document', maxCount: 1 },
      { name: 'profilePicture', maxCount: 1 },
    ]),
    controllers.applicants.createPublicApplicant
  );

  applicantsRouter.post('/verify-otp', controllers.applicants.verifyOTP);
  applicantsRouter.post('/resend-otp', controllers.applicants.resendOTP);

  applicantsRouter.put(
    '/update-offer-status',
    controllers.applicants.updateOfferStatus
  );
  applicantsRouter.use(verifyJWT);
  applicantsRouter.get(
    '/fetch-offers/:applicantId',
    verifyPermission,
    controllers.applicants.fetchAllOffers
  );
  applicantsRouter.post(
    '/create-offer',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.createOffer
  );
  applicantsRouter.post(
    '/fetch-all-applicants',
    verifyPermission,
    controllers.applicants.fetchAllApplicants
  );
  applicantsRouter.post(
    '/create-applicant',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.createApplicant
  );
  applicantsRouter.post(
    '/parse-resume/',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.parseApplicantResume
  );
  applicantsRouter.put(
    '/move-applicants',
    verifyPermission,
    controllers.applicants.moveApplicants
  );
  applicantsRouter.post(
    '/delete-applicants',
    verifyPermission,
    controllers.applicants.deleteApplicants
  );
  applicantsRouter.get(
    '/fetch-parsed-applicant/:applicantId',
    verifyPermission,
    controllers.applicants.fetchParsedApplicant
  );
  applicantsRouter.put(
    '/edit-applicant-personal-info',
    verifyPermission,
    controllers.applicants.editApplicantPersonalInfo
  );
  applicantsRouter.put(
    '/add-edit-candidate-experience',
    verifyPermission,
    controllers.applicants.addEditCandidateExperience
  );
  applicantsRouter.put(
    '/add-edit-candidate-education',
    verifyPermission,
    controllers.applicants.addEditCandidateEducation
  );
  applicantsRouter.put(
    '/edit-parsed-applicant',
    verifyPermission,
    controllers.applicants.editParsedApplicant
  );
  applicantsRouter.put(
    '/update-tags',
    verifyPermission,
    controllers.applicants.updateCandidateTags
  );
  applicantsRouter.put(
    '/update-resume',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.updateResume
  );
  applicantsRouter.put(
    '/delete-education',
    verifyPermission,
    controllers.applicants.deleteEducation
  );
  applicantsRouter.put(
    '/delete-experience',
    verifyPermission,
    controllers.applicants.deleteExperience
  );
  applicantsRouter.post(
    '/delete-application',
    verifyPermission,
    controllers.applicants.deleteApplication
  );
  applicantsRouter.post(
    '/add-candidate-resume',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.addCandidateResume
  );
  applicantsRouter.post(
    '/add-edit-candidate-picture',
    verifyPermission,
    upload.single('document'),
    controllers.applicants.addEditCandidatePicture
  );
  applicantsRouter.get(
    '/fetch-city-state-country-by-name/:name',
    controllers.applicants.fetchCityStateCountryByName
  );
  applicantsRouter.post(
    '/fetch-public-applicants',
    verifyPermission,
    controllers.applicants.fetchPublicApplicants
  );
  applicantsRouter.put(
    '/manage-applicant',
    verifyPermission,
    controllers.applicants.manageApplicant
  );
  applicantsRouter.get(
    '/fetch-documents/:applicantId',
    controllers.applicants.fetchAllDocuments
  );
  applicantsRouter.post(
    '/fetch-notes',
    verifyPermission,
    controllers.applicants.fetchNotes
  );
  applicantsRouter.post(
    '/set-applicant-note',
    verifyPermission,
    controllers.applicants.setApplicantNote
  );
  applicantsRouter.post(
    '/delete-applicant-note',
    verifyPermission,
    controllers.applicants.deleteApplicantNote
  );
  applicantsRouter.post(
    '/calculate-relevancy-score',
    controllers.applicants.calculateApplicantRelevancyScore
  );
  applicantsRouter.get(
    '/fetch-applicant-dicussion/:applicantId',
    verifyPermission,
    controllers.applicants.fetchApplicantDiscussion
  );
  applicantsRouter.post(
    '/discussion-comment',
    verifyPermission,
    controllers.applicants.commentApplicantDiscussion
  );
  applicantsRouter.put(
    '/move-applicant-stage',
    verifyPermission,
    controllers.applicants.moveApplicantsStages
  );

  applicantsRouter.post(
    '/upload-document',
    upload.single('document'),
    controllers.applicants.uploadDocument
  );

  applicantsRouter.use((err, req, res, next) => {
    // middleware for handling multer file wrong extension case
    if (err) {
      if (req.faultyResume === true)
        res.status(400).json({ success: false, message: err.message });
    }
  });
  return applicantsRouter;
};

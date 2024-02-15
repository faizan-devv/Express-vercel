const { Router } = require('express');
const multer = require('multer');
const express = require('express');
const {
  PUBLIC_PATH,
  PICTURES_PATH,
  FILE_SIZE,
} = require('../../constants/multerConstants');
const { verifyJWT } = require('../../middleware/auth');
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, PICTURES_PATH);
  },
  filename: (req, file, callback) => {
    const { entityName, entityFieldValueId } = req.params;
    const fileName =
      entityName +
      '-' +
      entityFieldValueId +
      '-' +
      Date.now() +
      '-' +
      file.originalname;
    callback(null, fileName);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: { fileSize: FILE_SIZE }, // 3MB
});

module.exports = (controllers) => {
  const commonRouter = new Router();
  commonRouter.use(express.static(PUBLIC_PATH));
  commonRouter.use(verifyJWT);
  commonRouter.post(
    '/upload-picture/:entityName/:entityFieldValueId',
    upload.single('file'),
    controllers.common.uploadPicture
  );
  commonRouter.get(
    '/fetch-country-dropdowns/:index/:entityName',
    controllers.common.fetchCountryDropDowns
  );
  return commonRouter;
};

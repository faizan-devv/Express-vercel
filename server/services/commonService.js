const fs = require('fs');
const path = require('path');
const { PICTURES_PATH } = require('../../server/constants/multerConstants');
const { BadRequestError } = require('../utils/errorTypes');

class CommonService {
  constructor(models, sequelize) {
    this.models = models;
    this.sequelize = sequelize;
  }
  fetchCountryDropDowns = async ({ index, entityName }) => {
    const results = await this.sequelize.query(
      'CALL SP_Get_Countrywise_state_and_city(:p_Id, :p_entity)',
      {
        replacements: { p_Id: parseInt(index), p_entity:entityName },
        type: this.sequelize.QueryTypes.RAW,
      }
    );
    return {
      results,
      success: true,
    };
  };

  uploadPicture = async (
    { entityName, entityFieldValueId },
    fileName,
    filePath
  ) => {
    if (this.models[entityName]) {
      const entity = await this.models[entityName].findOne({
        where: { ID: entityFieldValueId },
      });
      if (entity) {
        const setUserObject = {
          PictureURL: fileName,
        };
        await this.models[entityName].update(setUserObject, {
          where: { ID: entity.ID },
        });
        fs.readdir(PICTURES_PATH, (err, files) => {
          // this code is deleting all previous pictures of the user
          files.forEach((file) => {
            if (
              file.includes(`${entityName}-${entityFieldValueId}-`) &&
              !file.includes(fileName)
            ) {
              fs.unlinkSync(path.resolve(PICTURES_PATH + file));
            }
          });
        });
        return {
          pictureUrl: fileName,
          entityUpdated: entityName,
          success: true,
        };
      } else {
        fs.unlinkSync(path.resolve(filePath));
        throw new BadRequestError(
          `${entityName} table does not contain any record with ID ${entityFieldValueId}`
        );
      }
    } else {
      fs.unlinkSync(path.resolve(filePath));
      throw new BadRequestError(
        `no model exists with the provided entity name in db`
      );
    }
  };
}

module.exports = CommonService;

const Sequelize = require('sequelize');
const { max } = require('underscore');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'Companies',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Name']: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    ['WebsiteURL']: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    ['TotalEmployees']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['TimeZoneID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['YearFounded']: {
      type: Sequelize.SMALLINT,
    },
    ['Industry']: {
      type: Sequelize.STRING(50),
    },
    ['CompanyTypeID']: {
      type: Sequelize.TINYINT,
    },
    ['TagLine']: {
      type: Sequelize.STRING(100),
    },
    ['Description']: {
      type: Sequelize.STRING(max),
    },
    ['PictureURL']: {
      type: Sequelize.STRING(250),
    },
    ['BannerURL']: {
      type: Sequelize.STRING(250),
    },
    ['CreatedDate']: {
      allowNull: false,
      type: MSSQL_DATE,
    },
    ['ModifiedBy']: {
      type: Sequelize.BIGINT,
    },
    ['ModifiedDate']: {
      type: MSSQL_DATE,
    },
    ['IsActive']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    ['Title']: {
      type: Sequelize.STRING(150),
    },
    ['EmailAddress']: {
      type: Sequelize.STRING(100),
    },
    ['LinkedInURL']: {
      type: Sequelize.STRING(500),
    },
    ['TwitterURL']: {
      type: Sequelize.STRING(500),
    },
    ['FaceBookURL']: {
      type: Sequelize.STRING(500),
    },
    ['OpenPositionView']: {
      type: Sequelize.TINYINT,
    },
    ['BannerTextColor']: {
      type: Sequelize.STRING(9),
    },
    ['BannerBackgroundColor']: {
      type: Sequelize.STRING(9),
    },
    ['FooterTextColor']: {
      type: Sequelize.STRING(9),
    },
    ['FooterBackgroundColor']: {
      type: Sequelize.STRING(9),
    },
    ['BannerOverlayColor']: {
      type: Sequelize.STRING(9),
    },
    ['ButtonColor']: {
      type: Sequelize.STRING(9),
    },
    ['ButtonTextColor']: {
      type: Sequelize.STRING(9),
    },
    
    
    ['CompanyURL']: {
      type: Sequelize.STRING(300),
    },
  };

  return sequelize.define('Companies', definition, options);
};

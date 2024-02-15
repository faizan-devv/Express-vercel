const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateWorkingExperience',
  };

  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['ApplicantID']: {
      allowNull: false,
      type: Sequelize.BIGINT,
    },
    ['Designation']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['EmploymentTypeID']: {
      allowNull: false,
      type: Sequelize.TINYINT,
    },
    ['CompanyName']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['CountryID']: {
       
      type: Sequelize.INTEGER,
    },
    ['StateID']: {
       
      type: Sequelize.INTEGER,
    },
    ['CityID']: {
      
      type: Sequelize.INTEGER,
    },
    ['Description']: {
      type: Sequelize.STRING(1000),
    },
    ['StartDate']: {
   
      type: MSSQL_DATE,
    },
    ['IsCurrentRole']: {
      type: Sequelize.BOOLEAN,
    },
    ['EndDate']: {
      type: MSSQL_DATE,
    },
    ['CreatedBy']: {
      type: Sequelize.BIGINT,
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
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };

  return sequelize.define('CandidateWorkingExperience', definition, options);
};

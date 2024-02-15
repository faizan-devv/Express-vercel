const Sequelize = require('sequelize');
const { MSSQL_DATE } = require('../constants/customSequelizeDataTypes');

module.exports = (sequelize) => {
  const options = {
    timestamps: true,
    createdAt: 'CreatedDate',
    updatedAt: 'ModifiedDate',
    tableName: 'CandidateEducation',
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
    ['SchoolName']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['DegreeName']: {
      allowNull: false,
      type: Sequelize.STRING(250),
    },
    ['Description']: {
      type: Sequelize.STRING(500),
    },
    ['StartDate']: {
      type: MSSQL_DATE,
    },
    ['EndDate']: {
      type: MSSQL_DATE,
    },
    ['CGPA']: {
      type: Sequelize.STRING(50),
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

  return sequelize.define('CandidateEducation', definition, options);
};

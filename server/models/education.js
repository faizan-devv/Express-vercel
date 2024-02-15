const Sequelize = require('sequelize');
module.exports = (sequelize) => {
  const options = {
    timestamps: false,
    tableName: 'Education',
  };
  const definition = {
    ['ID']: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ['Title']: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    ['Description']: {
      type: Sequelize.STRING(200),
      default: 0,
    },
    ['IsDeleted']: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  };
  return sequelize.define('Education', definition, options);
};

'use strict'
module.exports = (sequelize, DataTypes) => {
  const Reflection = sequelize.define('Reflection', {
    content: DataTypes.TEXT,
  }, {});
  Reflection.associate = function (models) {
    // associations can be defined here
  };
  return Reflection;
}
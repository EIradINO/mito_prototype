'use strict'
module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    link: DataTypes.TEXT,
    title: DataTypes.TEXT,
    description: DataTypes.TEXT,
    image: DataTypes.TEXT,
  }, {});
  Content.associate = function (models) {
    // associations can be defined here
  };
  return Content;
}
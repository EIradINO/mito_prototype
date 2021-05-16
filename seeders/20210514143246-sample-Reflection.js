'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Reflections', [
      {
        content: '空はどうして青いのか気になりました。',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: '色の三原色について詳しく知りたいです。',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'メダカの生態に興味を持ちました。メダカを飼ってみたい!!',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Reflections', null, {});
  }
};

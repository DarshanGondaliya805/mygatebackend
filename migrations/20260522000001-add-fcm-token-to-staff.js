'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('staff', 'fcm_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'password',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('staff', 'fcm_token');
  },
};

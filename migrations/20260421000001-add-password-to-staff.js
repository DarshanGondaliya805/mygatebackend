'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('staff', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'documents',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('staff', 'password');
  },
};

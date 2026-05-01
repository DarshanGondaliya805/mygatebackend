'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('visitors', 'created_by_staff', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'created_by',
      references: { model: 'staff', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('visitors', 'created_by_staff');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('daily_helpers', 'helper_type', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Restore original ENUM — rows with custom values will be set to 'other'
    await queryInterface.sequelize.query(`
      UPDATE daily_helpers
      SET helper_type = 'other'
      WHERE helper_type NOT IN ('milkman','laundry','newspaper','cook','maid','driver','other')
    `);
    await queryInterface.changeColumn('daily_helpers', 'helper_type', {
      type: Sequelize.ENUM('milkman', 'laundry', 'newspaper', 'cook', 'maid', 'driver', 'other'),
      allowNull: false,
    });
  },
};

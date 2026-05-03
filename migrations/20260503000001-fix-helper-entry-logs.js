'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Drop & recreate created_by WITHOUT the users FK ───────────────────
    // The column currently has FK → users.id but security guards are staff,
    // not users — remove the constraint by dropping and re-adding the column.
    await queryInterface.removeColumn('helper_entry_logs', 'created_by');
    await queryInterface.addColumn('helper_entry_logs', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'out_time',
      comment: 'Admin user ID who logged the entry',
    });

    // ── 2. Add created_by_staff → staff.id ───────────────────────────────────
    await queryInterface.addColumn('helper_entry_logs', 'created_by_staff', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'created_by',
      references: { model: 'staff', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Security staff ID who logged the entry',
    });

    // ── 3. Add deletedAt column (global Sequelize config has paranoid:true) ──
    await queryInterface.addColumn('helper_entry_logs', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'updatedAt',
    });

    await queryInterface.addIndex('helper_entry_logs', ['created_by_staff']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('helper_entry_logs', ['created_by_staff']);
    await queryInterface.removeColumn('helper_entry_logs', 'deletedAt');
    await queryInterface.removeColumn('helper_entry_logs', 'created_by_staff');
    await queryInterface.removeColumn('helper_entry_logs', 'created_by');
    // Restore original created_by with users FK
    await queryInterface.addColumn('helper_entry_logs', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};

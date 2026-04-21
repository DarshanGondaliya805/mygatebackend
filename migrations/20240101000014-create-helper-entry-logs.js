'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('helper_entry_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        allowNull: false,
      },
      daily_helper_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'daily_helpers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      society_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'societies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      in_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      out_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Security guard who logged the entry',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('helper_entry_logs', ['daily_helper_id']);
    await queryInterface.addIndex('helper_entry_logs', ['society_id']);
    await queryInterface.addIndex('helper_entry_logs', ['in_time']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('helper_entry_logs');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('daily_helpers', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      helper_type: {
        type: Sequelize.ENUM('milkman', 'laundry', 'newspaper', 'cook', 'maid', 'driver', 'other'),
        allowNull: false,
      },
      // User/resident who registered this helper
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      flat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'flats', key: 'id' },
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
      // Allowed days (JSON array: ['monday','tuesday',...])
      allowed_days: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      allowed_time_start: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      allowed_time_end: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('daily_helpers', ['user_id']);
    await queryInterface.addIndex('daily_helpers', ['society_id']);
    await queryInterface.addIndex('daily_helpers', ['phone']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('daily_helpers');
  },
};

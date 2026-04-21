'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visitors', {
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
      visitor_type: {
        type: Sequelize.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
        allowNull: false,
        defaultValue: 'guest',
      },
      vehicle_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      // Which flat they are visiting
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
      // Who approved (user/resident)
      host_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // Who created the entry (security guard)
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'checked_out'),
        defaultValue: 'pending',
      },
      purpose: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      in_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      out_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // For pre-approved entries
      is_pre_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pre_approved_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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

    await queryInterface.addIndex('visitors', ['society_id']);
    await queryInterface.addIndex('visitors', ['flat_id']);
    await queryInterface.addIndex('visitors', ['phone']);
    await queryInterface.addIndex('visitors', ['visitor_type']);
    await queryInterface.addIndex('visitors', ['status']);
    await queryInterface.addIndex('visitors', ['in_time']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('visitors');
  },
};

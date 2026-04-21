'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('complaints', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('maintenance', 'noise', 'parking', 'cleanliness', 'security', 'water', 'electricity', 'lift', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of complaint image paths',
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed', 'rejected'),
        defaultValue: 'open',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
      },
      admin_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // User who raised complaint
      raised_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Admin who is assigned
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      flat_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'flats', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      society_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'societies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      resolved_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('complaints', ['society_id']);
    await queryInterface.addIndex('complaints', ['raised_by']);
    await queryInterface.addIndex('complaints', ['status']);
    await queryInterface.addIndex('complaints', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('complaints');
  },
};

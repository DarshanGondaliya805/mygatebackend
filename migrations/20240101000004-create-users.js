'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
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
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      // Role in the system
      role: {
        type: Sequelize.ENUM('super_admin', 'admin', 'user', 'security'),
        allowNull: false,
        defaultValue: 'user',
      },
      // For residents: owner / rented
      user_type: {
        type: Sequelize.ENUM('owner', 'rented'),
        allowNull: true,
      },
      // Flat assignment (null for security/admins without flat)
      flat_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'flats', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      society_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'societies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // Approval status (new registrations need admin approval)
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      fcm_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      last_login: {
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

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['society_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};

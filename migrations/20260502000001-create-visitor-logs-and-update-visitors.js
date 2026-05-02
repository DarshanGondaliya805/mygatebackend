'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Create visitor_logs table ─────────────────────────────────────────
    await queryInterface.createTable('visitor_logs', {
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
      visitor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'visitors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      visitor_type: {
        type: Sequelize.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
        allowNull: false,
        defaultValue: 'guest',
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
      host_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by_staff: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'staff', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'checked_out'),
        allowNull: false,
        defaultValue: 'pending',
      },
      purpose: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      in_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      out_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
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

    await queryInterface.addIndex('visitor_logs', ['visitor_id']);
    await queryInterface.addIndex('visitor_logs', ['flat_id']);
    await queryInterface.addIndex('visitor_logs', ['society_id']);
    await queryInterface.addIndex('visitor_logs', ['status']);
    await queryInterface.addIndex('visitor_logs', ['visitor_type']);
    await queryInterface.addIndex('visitor_logs', ['in_time']);
    await queryInterface.addIndex('visitor_logs', ['out_time']);

    // ── 2. Remove visit-specific columns from visitors (keep profile only) ──
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const colsToDrop = [
      'visitor_type',
      'flat_id',
      'host_user_id',
      'created_by',
      'created_by_staff',
      'status',
      'purpose',
      'in_time',
      'out_time',
      'is_pre_approved',
      'pre_approved_date',
    ];

    for (const col of colsToDrop) {
      await queryInterface.removeColumn('visitors', col);
    }

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down(queryInterface, Sequelize) {
    // ── 1. Restore removed columns to visitors ────────────────────────────────
    await queryInterface.addColumn('visitors', 'visitor_type', {
      type: Sequelize.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
      allowNull: false,
      defaultValue: 'guest',
    });
    await queryInterface.addColumn('visitors', 'flat_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'host_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'created_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'created_by_staff', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'checked_out'),
      defaultValue: 'pending',
    });
    await queryInterface.addColumn('visitors', 'purpose', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'in_time', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'out_time', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('visitors', 'is_pre_approved', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('visitors', 'pre_approved_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // ── 2. Drop visitor_logs table ────────────────────────────────────────────
    await queryInterface.dropTable('visitor_logs');
  },
};

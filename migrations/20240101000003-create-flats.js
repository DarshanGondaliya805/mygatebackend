'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flats', {
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
      flat_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      block_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'blocks', key: 'id' },
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
      type: {
        type: Sequelize.ENUM('1BHK', '2BHK', '3BHK', '4BHK', 'studio', 'penthouse', 'other'),
        allowNull: true,
      },
      is_occupied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('flats', ['block_id']);
    await queryInterface.addIndex('flats', ['society_id']);
    await queryInterface.addIndex('flats', ['block_id', 'flat_number'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('flats');
  },
};

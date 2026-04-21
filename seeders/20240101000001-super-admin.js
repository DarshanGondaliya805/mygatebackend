'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'super_admin' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log('⚠️  Super admin already exists, skipping seed.');
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      salt
    );

    await queryInterface.bulkInsert('users', [
      {
        uuid: uuidv4(),
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@mygate.com',
        phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
        password: hashedPassword,
        role: 'super_admin',
        is_approved: true,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Super admin seeded successfully');
    console.log(`   Email: ${process.env.SUPER_ADMIN_EMAIL || 'superadmin@mygate.com'}`);
    console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      role: 'super_admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@mygate.com',
    });
  },
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'mygate_dev',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
        max: parseInt(process.env.DB_POOL_MAX || '5'),
        min: parseInt(process.env.DB_POOL_MIN || '0'),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    },
    define: {
        timestamps: true,
        underscored: false,
        paranoid: true, // soft delete (deletedAt)
    },
};
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
});
const connectDatabase = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = exports.sequelize;
//# sourceMappingURL=db.js.map
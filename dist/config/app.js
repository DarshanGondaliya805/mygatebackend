"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    upload: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    superAdmin: {
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@mygate.com',
        phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
        password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
    },
};
exports.default = exports.config;
//# sourceMappingURL=app.js.map
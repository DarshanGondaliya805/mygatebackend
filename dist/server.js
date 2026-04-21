"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const app_2 = __importDefault(require("./config/app"));
const logger_1 = __importDefault(require("./utils/logger"));
const startServer = async () => {
    try {
        await (0, db_1.connectDatabase)();
        const server = app_1.default.listen(app_2.default.port, () => {
            logger_1.default.info(`🚀 MyGate API running on port ${app_2.default.port} [${app_2.default.env}]`);
            logger_1.default.info(`📦 Health check: http://localhost:${app_2.default.port}/health`);
            logger_1.default.info(`🔗 API base:     http://localhost:${app_2.default.port}/api/v1`);
        });
        const shutdown = async (signal) => {
            logger_1.default.info(`${signal} received. Shutting down gracefully...`);
            server.close(() => {
                logger_1.default.info('HTTP server closed');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => logger_1.default.error('Unhandled rejection:', reason));
        process.on('uncaughtException', (err) => {
            logger_1.default.error('Uncaught exception:', err);
            process.exit(1);
        });
    }
    catch (err) {
        logger_1.default.error('Failed to start server:', err);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map
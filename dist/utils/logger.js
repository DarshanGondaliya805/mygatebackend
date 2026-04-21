"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.dirname(process.env.LOG_FILE || './logs/app.log');
if (!fs_1.default.existsSync(logDir))
    fs_1.default.mkdirSync(logDir, { recursive: true });
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    transports: [
        new winston_1.default.transports.File({
            filename: process.env.LOG_FILE || './logs/app.log',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: (process.env.LOG_FILE || './logs/app.log').replace('app.log', 'error.log'),
            level: 'error',
        }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }));
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const messages = err.errors?.map((e) => e.message) || [err.message];
        res.status(400).json({ success: false, message: messages.join(', ') });
        return;
    }
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, message: 'File too large' });
        return;
    }
    // Operational errors (AppError)
    if (err.isOperational) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    // Unhandled errors
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};
exports.notFound = notFound;
//# sourceMappingURL=error.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationMeta = exports.getPagination = exports.sendServerError = exports.sendNotFound = exports.sendForbidden = exports.sendUnauthorized = exports.sendCreated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200, pagination) => {
    const response = { success: true, message, data };
    if (pagination)
        response.pagination = pagination;
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, error) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && error ? { error } : {}),
    });
};
exports.sendError = sendError;
const sendCreated = (res, message, data) => (0, exports.sendSuccess)(res, message, data, 201);
exports.sendCreated = sendCreated;
const sendUnauthorized = (res, message = 'Unauthorized') => (0, exports.sendError)(res, message, 401);
exports.sendUnauthorized = sendUnauthorized;
const sendForbidden = (res, message = 'Forbidden') => (0, exports.sendError)(res, message, 403);
exports.sendForbidden = sendForbidden;
const sendNotFound = (res, message = 'Not found') => (0, exports.sendError)(res, message, 404);
exports.sendNotFound = sendNotFound;
const sendServerError = (res, error) => (0, exports.sendError)(res, 'Internal server error', 500, error);
exports.sendServerError = sendServerError;
const getPagination = (page, limit) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};
exports.getPagination = getPagination;
const getPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
});
exports.getPaginationMeta = getPaginationMeta;
//# sourceMappingURL=response.js.map
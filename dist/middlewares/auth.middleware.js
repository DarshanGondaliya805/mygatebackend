"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSameSociety = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const models_1 = require("../models");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.sendUnauthorized)(res, 'No token provided');
            return;
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.source === 'staff') {
            const staff = await models_1.Staff.findOne({ where: { id: payload.id, is_active: true } });
            if (!staff) {
                (0, response_1.sendUnauthorized)(res, 'Staff not found or inactive');
                return;
            }
            req.user = { ...payload, role: 'security', dbUser: staff };
        }
        else {
            const user = await models_1.User.findOne({ where: { id: payload.id, is_active: true, is_approved: true } });
            if (!user) {
                (0, response_1.sendUnauthorized)(res, 'User not found or inactive');
                return;
            }
            req.user = { ...payload, dbUser: user };
        }
        next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            (0, response_1.sendUnauthorized)(res, 'Token expired');
        }
        else {
            (0, response_1.sendUnauthorized)(res, 'Invalid token');
        }
    }
};
exports.authenticate = authenticate;
// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendUnauthorized)(res);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_1.sendForbidden)(res, 'You do not have permission to perform this action');
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Society-level access - user must belong to the same society
const requireSameSociety = (req, res, next) => {
    const societyId = parseInt(req.params.societyId || req.body.society_id) ||
        req.user?.society_id;
    if (req.user?.role !== 'super_admin' &&
        req.user?.society_id !== societyId) {
        (0, response_1.sendForbidden)(res, 'Access denied to this society');
        return;
    }
    next();
};
exports.requireSameSociety = requireSameSociety;
//# sourceMappingURL=auth.middleware.js.map
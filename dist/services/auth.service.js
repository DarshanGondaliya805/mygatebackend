"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middlewares/error.middleware");
class AuthService {
    async login(identifier, password) {
        const identify = String(identifier).trim();
        const user = await models_1.User.unscoped().findOne({
            where: {
                is_active: true,
                ...(identify.includes('@') ? { email: identify } : { phone: identify }),
            },
        });
        if (!user)
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        if (!user.is_approved)
            throw new error_middleware_1.AppError('Your account is pending approval', 403);
        const isMatch = await bcryptjs_1.default.compare(password, user.dataValues.password);
        if (!isMatch)
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        const payload = {
            id: user.id,
            uuid: user.uuid,
            role: user.role,
            society_id: user.society_id,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // Store hashed refresh token
        await user.update({ refresh_token: refreshToken, last_login: new Date() });
        const { id, uuid, name, email, phone, role } = user.dataValues;
        return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role } };
    }
    async refreshToken(token) {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const user = await models_1.User.findOne({
            where: { id: payload.id, is_active: true },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 401);
        const newPayload = {
            id: user.id,
            uuid: user.uuid,
            role: user.role,
            society_id: user.society_id,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(newPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(newPayload);
        await user.update({ refresh_token: refreshToken });
        return { accessToken, refreshToken };
    }
    async logout(userId) {
        await models_1.User.update({ refresh_token: null }, { where: { id: userId } });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await models_1.User.unscoped().findByPk(userId);
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.dataValues.password);
        if (!isMatch)
            throw new error_middleware_1.AppError('Current password is incorrect', 400);
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashed = await bcryptjs_1.default.hash(newPassword, salt);
        await user.update({ password: hashed });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map
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
    async login(identifier, password, fcmToken) {
        const identify = String(identifier).trim();
        const byEmail = identify.includes('@');
        // ── 1. Try users table first ──────────────────────────────────────────────
        const user = await models_1.User.unscoped().findOne({
            where: {
                is_active: true,
                ...(byEmail ? { email: identify } : { phone: identify }),
            },
            attributes: ['id', 'uuid', 'name', 'email', 'phone', 'password', 'role', 'society_id', 'is_approved', 'is_active', 'fcm_token', 'last_login'],
        });
        if (user) {
            if (!user.is_approved)
                throw new error_middleware_1.AppError('Your account is pending approval', 403);
            const storedHash = user.getDataValue('password');
            const isMatch = storedHash ? await bcryptjs_1.default.compare(password, storedHash) : false;
            if (!isMatch)
                throw new error_middleware_1.AppError('Invalid credentials', 401);
            const payload = { id: user.id, uuid: user.uuid, role: user.role, society_id: user.society_id, source: 'user' };
            const accessToken = (0, jwt_1.generateAccessToken)(payload);
            const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
            await user.update({
                refresh_token: refreshToken,
                last_login: new Date(),
                ...(fcmToken ? { fcm_token: fcmToken } : {}),
            });
            const { id, uuid, name, email, phone, role, society_id } = user.dataValues;
            return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role, source: 'user', society_id: society_id } };
        }
        // ── 2. Fall back to staff table ───────────────────────────────────────────
        const staff = await models_1.Staff.unscoped().findOne({
            where: {
                is_active: true,
                ...(byEmail ? { email: identify } : { phone: identify }),
            },
            attributes: ['id', 'uuid', 'name', 'email', 'phone', 'password', 'staff_type', 'society_id', 'is_active'],
        });
        if (!staff)
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        const staffHash = staff.getDataValue('password');
        if (!staffHash)
            throw new error_middleware_1.AppError('Password not set for this staff account', 400);
        const staffMatch = await bcryptjs_1.default.compare(password, staffHash);
        if (!staffMatch)
            throw new error_middleware_1.AppError('Invalid credentials', 401);
        const staffPayload = { id: staff.id, uuid: staff.uuid, role: 'security', society_id: staff.society_id, source: 'staff' };
        const accessToken = (0, jwt_1.generateAccessToken)(staffPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(staffPayload);
        const { id, uuid, name, email, phone, staff_type, society_id } = staff.dataValues;
        return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role: 'security', staff_type, source: 'staff', society_id: society_id } };
    }
    async refreshToken(token) {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        if (payload.source === 'staff') {
            const staff = await models_1.Staff.unscoped().findOne({
                where: { id: payload.id, is_active: true },
                attributes: ['id', 'uuid', 'staff_type', 'society_id', 'is_active'],
            });
            if (!staff)
                throw new error_middleware_1.AppError('Staff not found', 401);
            const newPayload = { id: staff.id, uuid: staff.uuid, role: 'security', society_id: staff.society_id, source: 'staff' };
            return {
                accessToken: (0, jwt_1.generateAccessToken)(newPayload),
                refreshToken: (0, jwt_1.generateRefreshToken)(newPayload),
            };
        }
        const user = await models_1.User.unscoped().findOne({
            where: { id: payload.id, is_active: true },
            attributes: ['id', 'uuid', 'role', 'society_id', 'is_approved', 'is_active'],
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 401);
        const newPayload = { id: user.id, uuid: user.uuid, role: user.role, society_id: user.society_id, source: 'user' };
        const accessToken = (0, jwt_1.generateAccessToken)(newPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(newPayload);
        await user.update({ refresh_token: refreshToken });
        return { accessToken, refreshToken };
    }
    async logout(userId, source) {
        if (source === 'staff')
            return; // staff table has no refresh_token column
        await models_1.User.update({ refresh_token: null, fcm_token: null }, { where: { id: userId } });
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await models_1.User.unscoped().findByPk(userId, {
            attributes: ['id', 'password'],
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.getDataValue('password'));
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
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const response_1 = require("../utils/response");
class AuthController {
    async login(req, res, next) {
        try {
            const { identifier, password, fcm_token } = req.body;
            console.log(fcm_token, "lllllllllll");
            const result = await auth_service_1.default.login(identifier, password, fcm_token);
            (0, response_1.sendSuccess)(res, 'Login successful', result);
        }
        catch (err) {
            next(err);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refresh_token } = req.body;
            const result = await auth_service_1.default.refreshToken(refresh_token);
            (0, response_1.sendSuccess)(res, 'Token refreshed', result);
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            await auth_service_1.default.logout(req.user.id);
            (0, response_1.sendSuccess)(res, 'Logged out successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { old_password, new_password } = req.body;
            await auth_service_1.default.changePassword(req.user.id, old_password, new_password);
            (0, response_1.sendSuccess)(res, 'Password changed successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async me(req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, 'Profile fetched', req.user?.dbUser);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map
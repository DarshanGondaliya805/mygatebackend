"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../config/app"));
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, app_1.default.jwt.secret, {
        expiresIn: app_1.default.jwt.expiresIn,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, app_1.default.jwt.refreshSecret, {
        expiresIn: app_1.default.jwt.refreshExpiresIn,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, app_1.default.jwt.secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, app_1.default.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map
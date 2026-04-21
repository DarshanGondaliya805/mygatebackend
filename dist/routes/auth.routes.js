"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
const loginValidation = [
    (0, express_validator_1.body)('identifier').notEmpty().withMessage('Phone or email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
const refreshValidation = [
    (0, express_validator_1.body)('refresh_token').notEmpty().withMessage('Refresh token is required'),
];
const changePasswordValidation = [
    (0, express_validator_1.body)('old_password').notEmpty(),
    (0, express_validator_1.body)('new_password').isLength({ min: 8 }).withMessage('Min 8 characters'),
];
// Public routes
router.post('/login', (0, validate_middleware_1.validate)(loginValidation), auth_controller_1.default.login.bind(auth_controller_1.default));
router.post('/refresh', (0, validate_middleware_1.validate)(refreshValidation), auth_controller_1.default.refreshToken.bind(auth_controller_1.default));
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/logout', auth_controller_1.default.logout.bind(auth_controller_1.default));
router.get('/me', auth_controller_1.default.me.bind(auth_controller_1.default));
router.put('/change-password', (0, validate_middleware_1.validate)(changePasswordValidation), auth_controller_1.default.changePassword.bind(auth_controller_1.default));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
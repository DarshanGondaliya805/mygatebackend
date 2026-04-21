"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
// Public: self-registration
router.post('/register', (0, upload_1.uploadSingle)('image'), user_controller_1.default.register.bind(user_controller_1.default));
router.use(auth_middleware_1.authenticate);
// Directory (all authenticated users can see building directory)
router.get('/directory', user_controller_1.default.getBuildingDirectory.bind(user_controller_1.default));
// Admin & Super Admin only
router.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadSingle)('image'), user_controller_1.default.create.bind(user_controller_1.default));
router.get('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), user_controller_1.default.getAll.bind(user_controller_1.default));
router.get('/unapproved', (0, auth_middleware_1.authorize)('super_admin', 'admin'), user_controller_1.default.getUnapproved.bind(user_controller_1.default));
router.post('/unapproved', (0, auth_middleware_1.authorize)('super_admin', 'admin'), user_controller_1.default.getUnapproved.bind(user_controller_1.default));
router.put('/:id/approve', (0, auth_middleware_1.authorize)('super_admin', 'admin'), user_controller_1.default.approve.bind(user_controller_1.default));
router.put('/:id/toggle-active', (0, auth_middleware_1.authorize)('super_admin'), user_controller_1.default.toggleActive.bind(user_controller_1.default));
router.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), user_controller_1.default.delete.bind(user_controller_1.default));
// Self or admin
router.get('/:id', user_controller_1.default.getOne.bind(user_controller_1.default));
router.put('/:id', (0, upload_1.uploadSingle)('image'), user_controller_1.default.update.bind(user_controller_1.default));
exports.default = router;
//# sourceMappingURL=user.routes.js.map
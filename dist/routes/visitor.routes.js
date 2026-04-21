"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitor_controller_1 = __importDefault(require("../controllers/visitor.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Security creates entries
router.post('/', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), (0, upload_1.uploadSingle)('image'), visitor_controller_1.default.create.bind(visitor_controller_1.default));
// User pre-approves
router.post('/pre-approve', (0, auth_middleware_1.authorize)('user', 'admin'), visitor_controller_1.default.preApprove.bind(visitor_controller_1.default));
// Look up repeat visitor by phone
router.get('/lookup/:phone', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), visitor_controller_1.default.getByPhone.bind(visitor_controller_1.default));
// List (filtered by role in controller)
router.get('/', visitor_controller_1.default.getAll.bind(visitor_controller_1.default));
// User approves/rejects
router.put('/:id/status', (0, auth_middleware_1.authorize)('user', 'admin'), visitor_controller_1.default.updateStatus.bind(visitor_controller_1.default));
// Security marks checkout
router.put('/:id/checkout', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), visitor_controller_1.default.checkout.bind(visitor_controller_1.default));
exports.default = router;
//# sourceMappingURL=visitor.routes.js.map
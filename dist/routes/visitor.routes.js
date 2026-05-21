"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const visitor_controller_1 = __importDefault(require("../controllers/visitor.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Security: create visitor entry (creates/updates visitor profile + new visit log)
router.post('/', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), (0, upload_1.uploadSingle)('image'), (0, validate_middleware_1.validate)([
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('flat_id').notEmpty().withMessage('Flat ID is required').isInt().withMessage('Flat ID must be a valid integer'),
    (0, express_validator_1.body)('visitor_type').isIn(['guest', 'delivery', 'cab', 'courier', 'maintenance', 'other']).withMessage('Invalid visitor type'),
]), visitor_controller_1.default.create.bind(visitor_controller_1.default));
// User: pre-approve upcoming visitor
router.post('/pre-approve', (0, auth_middleware_1.authorize)('user', 'admin'), visitor_controller_1.default.preApprove.bind(visitor_controller_1.default));
// Look up repeat visitor profile by phone (for auto-fill)
router.get('/lookup/:phone', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), visitor_controller_1.default.getByPhone.bind(visitor_controller_1.default));
// User / security: poll for pending requests created in last N seconds (default 30)
router.get('/pending-requests', visitor_controller_1.default.getRecentPendingRequests.bind(visitor_controller_1.default));
// List all visitor logs (filtered by role, supports date / date range / type / status / flat)
router.get('/', visitor_controller_1.default.getAll.bind(visitor_controller_1.default));
// Get all visit logs for a specific visitor profile
router.get('/:id/logs', visitor_controller_1.default.getVisitorLogs.bind(visitor_controller_1.default));
// User: approve / reject a visitor log entry
router.put('/:id/status', (0, auth_middleware_1.authorize)('user', 'admin'), visitor_controller_1.default.updateStatus.bind(visitor_controller_1.default));
// Security: approve / reject visitor only if resident hasn't acted yet (status = pending)
router.put('/:id/security-override', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), visitor_controller_1.default.securityOverrideStatus.bind(visitor_controller_1.default));
// Security: mark visitor checkout (sets out_time)
router.put('/:id/checkout', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), visitor_controller_1.default.checkout.bind(visitor_controller_1.default));
exports.default = router;
//# sourceMappingURL=visitor.routes.js.map
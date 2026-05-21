"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amenityRouter = exports.policyRouter = exports.serviceRouter = exports.eventRouter = exports.helperRouter = exports.staffRouter = void 0;
const express_1 = require("express");
const misc_controller_1 = require("../controllers/misc.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
// ─── Staff Routes ─────────────────────────────────────────────────────────────
exports.staffRouter = (0, express_1.Router)();
exports.staffRouter.use(auth_middleware_1.authenticate);
exports.staffRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadFields)([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), misc_controller_1.staffController.create.bind(misc_controller_1.staffController));
exports.staffRouter.get('/', misc_controller_1.staffController.getAll.bind(misc_controller_1.staffController));
exports.staffRouter.put('/profile', (0, auth_middleware_1.authorize)('security'), misc_controller_1.staffController.updateProfile.bind(misc_controller_1.staffController));
exports.staffRouter.get('/:id', misc_controller_1.staffController.getOne.bind(misc_controller_1.staffController));
exports.staffRouter.put('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadFields)([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), misc_controller_1.staffController.update.bind(misc_controller_1.staffController));
exports.staffRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.staffController.delete.bind(misc_controller_1.staffController));
// ─── Daily Helper Routes ──────────────────────────────────────────────────────
exports.helperRouter = (0, express_1.Router)();
exports.helperRouter.use(auth_middleware_1.authenticate);
exports.helperRouter.post('/', (0, auth_middleware_1.authorize)('user', 'admin'), (0, upload_1.uploadSingle)('image'), misc_controller_1.dailyHelperController.create.bind(misc_controller_1.dailyHelperController));
exports.helperRouter.get('/my', (0, auth_middleware_1.authorize)('user'), misc_controller_1.dailyHelperController.getMyHelpers.bind(misc_controller_1.dailyHelperController));
exports.helperRouter.get('/', (0, auth_middleware_1.authorize)('admin', 'super_admin', 'security'), misc_controller_1.dailyHelperController.getAllForSociety.bind(misc_controller_1.dailyHelperController));
exports.helperRouter.post('/entry', (0, auth_middleware_1.authorize)('security', 'admin'), misc_controller_1.dailyHelperController.logEntry.bind(misc_controller_1.dailyHelperController));
exports.helperRouter.put('/:helper_id/exit', (0, auth_middleware_1.authorize)('security', 'admin'), misc_controller_1.dailyHelperController.logExit.bind(misc_controller_1.dailyHelperController));
exports.helperRouter.get('/logs', (0, auth_middleware_1.authorize)('security', 'admin', 'super_admin'), misc_controller_1.dailyHelperController.getLogs.bind(misc_controller_1.dailyHelperController));
// ─── Event Routes ─────────────────────────────────────────────────────────────
exports.eventRouter = (0, express_1.Router)();
exports.eventRouter.use(auth_middleware_1.authenticate);
exports.eventRouter.post('/', (0, auth_middleware_1.authorize)('admin', 'super_admin'), (0, upload_1.uploadSingle)('image'), misc_controller_1.eventController.create.bind(misc_controller_1.eventController));
exports.eventRouter.get('/', misc_controller_1.eventController.getAll.bind(misc_controller_1.eventController));
exports.eventRouter.put('/:id', (0, auth_middleware_1.authorize)('admin', 'super_admin'), (0, upload_1.uploadSingle)('image'), misc_controller_1.eventController.update.bind(misc_controller_1.eventController));
exports.eventRouter.delete('/:id', (0, auth_middleware_1.authorize)('admin', 'super_admin'), misc_controller_1.eventController.delete.bind(misc_controller_1.eventController));
// ─── Service Contact Routes ───────────────────────────────────────────────────
exports.serviceRouter = (0, express_1.Router)();
exports.serviceRouter.use(auth_middleware_1.authenticate);
exports.serviceRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.serviceContactController.create.bind(misc_controller_1.serviceContactController));
exports.serviceRouter.get('/', misc_controller_1.serviceContactController.getAll.bind(misc_controller_1.serviceContactController));
exports.serviceRouter.put('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.serviceContactController.update.bind(misc_controller_1.serviceContactController));
exports.serviceRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.serviceContactController.delete.bind(misc_controller_1.serviceContactController));
// ─── Policy Routes ────────────────────────────────────────────────────────────
exports.policyRouter = (0, express_1.Router)();
exports.policyRouter.use(auth_middleware_1.authenticate);
exports.policyRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.policyController.create.bind(misc_controller_1.policyController));
exports.policyRouter.get('/', misc_controller_1.policyController.getAll.bind(misc_controller_1.policyController));
exports.policyRouter.put('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.policyController.update.bind(misc_controller_1.policyController));
exports.policyRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.policyController.delete.bind(misc_controller_1.policyController));
// ─── Amenity Routes ───────────────────────────────────────────────────────────
exports.amenityRouter = (0, express_1.Router)();
exports.amenityRouter.use(auth_middleware_1.authenticate);
exports.amenityRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadSingle)('image'), misc_controller_1.amenityController.create.bind(misc_controller_1.amenityController));
exports.amenityRouter.get('/', misc_controller_1.amenityController.getAll.bind(misc_controller_1.amenityController));
exports.amenityRouter.put('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadSingle)('image'), misc_controller_1.amenityController.update.bind(misc_controller_1.amenityController));
exports.amenityRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), misc_controller_1.amenityController.delete.bind(misc_controller_1.amenityController));
//# sourceMappingURL=misc.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaint_controller_1 = __importDefault(require("../controllers/complaint.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/', (0, auth_middleware_1.authorize)('user', 'admin'), (0, upload_1.uploadMultiple)('images', 3), complaint_controller_1.default.create.bind(complaint_controller_1.default));
router.get('/', complaint_controller_1.default.getAll.bind(complaint_controller_1.default));
router.get('/:id', complaint_controller_1.default.getOne.bind(complaint_controller_1.default));
router.put('/:id/status', (0, auth_middleware_1.authorize)('admin', 'super_admin'), complaint_controller_1.default.updateStatus.bind(complaint_controller_1.default));
exports.default = router;
//# sourceMappingURL=complaint.routes.js.map
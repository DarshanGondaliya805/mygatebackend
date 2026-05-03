"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const society_controller_1 = __importDefault(require("../controllers/society.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
router.get('/getallsociety', society_controller_1.default.getallSociety.bind(society_controller_1.default));
router.use(auth_middleware_1.authenticate);
router.post('/', (0, auth_middleware_1.authorize)('super_admin'), (0, upload_1.uploadSingle)('logo'), society_controller_1.default.create.bind(society_controller_1.default));
router.get('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), society_controller_1.default.getAll.bind(society_controller_1.default));
router.get('/:id', society_controller_1.default.getOne.bind(society_controller_1.default));
router.put('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), (0, upload_1.uploadSingle)('logo'), society_controller_1.default.update.bind(society_controller_1.default));
router.put('/:id/toggle-active', (0, auth_middleware_1.authorize)('super_admin'), society_controller_1.default.toggleActive.bind(society_controller_1.default));
router.delete('/:id', (0, auth_middleware_1.authorize)('super_admin'), society_controller_1.default.delete.bind(society_controller_1.default));
exports.default = router;
//# sourceMappingURL=society.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const notification_service_1 = __importDefault(require("../services/notification.service"));
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// POST /notifications/test — send a test notification to yourself
router.post('/test', async (req, res, next) => {
    try {
        const { title = 'Test Notification', body = 'If you see this, notifications are working!' } = req.body;
        await notification_service_1.default.send({
            user_id: req.user.id,
            title,
            body,
            type: 'other',
        });
        (0, response_1.sendSuccess)(res, 'Test notification sent', { user_id: req.user.id, title, body });
    }
    catch (err) {
        next(err);
    }
});
// GET /notifications?page=1&limit=20&unread=true
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const unreadOnly = req.query.unread === 'true';
        const result = await notification_service_1.default.getAll(req.user.id, page, limit, unreadOnly);
        (0, response_1.sendSuccess)(res, 'Notifications fetched', result.rows, 200, {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        });
    }
    catch (err) {
        next(err);
    }
});
// PUT /notifications/read-all — must be before /:id/read to avoid route conflict
router.put('/read-all', async (req, res, next) => {
    try {
        await notification_service_1.default.markAllRead(req.user.id);
        (0, response_1.sendSuccess)(res, 'All notifications marked as read');
    }
    catch (err) {
        next(err);
    }
});
// PUT /notifications/:id/read — mark single notification as read
router.put('/:id/read', async (req, res, next) => {
    try {
        const found = await notification_service_1.default.markOneRead(parseInt(req.params.id), req.user.id);
        if (!found) {
            (0, response_1.sendNotFound)(res, 'Notification not found');
            return;
        }
        (0, response_1.sendSuccess)(res, 'Notification marked as read');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationService {
    async send(payload) {
        // Save to DB
        await models_1.Notification.create({
            user_id: payload.user_id,
            title: payload.title,
            body: payload.body,
            type: payload.type,
            reference_id: payload.reference_id ?? null,
            reference_type: payload.reference_type ?? null,
        });
        // Send push via FCM if user has a token
        try {
            const user = await models_1.User.findByPk(payload.user_id, {
                attributes: ['fcm_token'],
            });
            if (user?.fcm_token) {
                await this.sendFCM(user.fcm_token, payload.title, payload.body);
            }
        }
        catch (err) {
            logger_1.default.warn(`FCM push failed for user ${payload.user_id}:`, err);
        }
    }
    async sendToMany(userIds, payload) {
        await Promise.allSettled(userIds.map((id) => this.send({ ...payload, user_id: id })));
    }
    async sendFCM(token, title, body) {
        // Firebase Admin SDK integration point
        // Uncomment and configure once Firebase is set up:
        // import admin from 'firebase-admin';
        // await admin.messaging().send({ token, notification: { title, body } });
        logger_1.default.info(`[FCM] Would send to token ${token.substring(0, 10)}...: ${title}`);
    }
    async getAll(userId, page = 1, limit = 20, unreadOnly = false) {
        const where = { user_id: userId };
        if (unreadOnly)
            where.is_read = false;
        const offset = (page - 1) * limit;
        const { count, rows } = await models_1.Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        return { rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
    }
    async markOneRead(notificationId, userId) {
        const notification = await models_1.Notification.findOne({
            where: { id: notificationId, user_id: userId },
        });
        if (!notification)
            return false;
        await notification.update({ is_read: true, read_at: new Date() });
        return true;
    }
    async markAllRead(userId) {
        await models_1.Notification.update({ is_read: true, read_at: new Date() }, { where: { user_id: userId, is_read: false } });
    }
}
exports.NotificationService = NotificationService;
exports.default = new NotificationService();
//# sourceMappingURL=notification.service.js.map
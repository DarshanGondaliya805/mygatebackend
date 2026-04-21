import { Notification, User } from '../models';
import { NotificationType } from '../models/Notification';
import logger from '../utils/logger';
import admin from '../config/firebase';

interface SendNotificationPayload {
  user_id: number;
  title: string;
  body: string;
  type: NotificationType;
  reference_id?: number;
  reference_type?: string;
}

export class NotificationService {
  async send(payload: SendNotificationPayload): Promise<void> {
    // Save to DB
    await Notification.create({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      reference_id: payload.reference_id ?? null,
      reference_type: payload.reference_type ?? null,
    });

    // Send push via FCM if user has a token
    try {
      const user = await User.findByPk(payload.user_id, {
        attributes: ['fcm_token'],
      });
      if (user?.fcm_token) {
        await this.sendFCM(user.fcm_token, payload.title, payload.body);
      }
    } catch (err) {
      logger.warn(`FCM push failed for user ${payload.user_id}:`, err);
    }
  }

  async sendToMany(userIds: number[], payload: Omit<SendNotificationPayload, 'user_id'>): Promise<void> {
    await Promise.allSettled(userIds.map((id) => this.send({ ...payload, user_id: id })));
  }

  private async sendFCM(token: string, title: string, body: string): Promise<void> {
    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    logger.info(`[FCM] Sent to token ${token.substring(0, 10)}...: ${title}`);
  }

  async getAll(userId: number, page = 1, limit = 20, unreadOnly = false) {
    const where: any = { user_id: userId };
    if (unreadOnly) where.is_read = false;
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async markOneRead(notificationId: number, userId: number): Promise<boolean> {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId },
    });
    if (!notification) return false;
    await notification.update({ is_read: true, read_at: new Date() });
    return true;
  }

  async markAllRead(userId: number): Promise<void> {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
  }
}

export default new NotificationService();

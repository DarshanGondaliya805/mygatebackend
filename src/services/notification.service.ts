import { Notification, User, Staff } from '../models';
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
  // ── Display notification + DB record (residents / users) ──────────────────
  async send(payload: SendNotificationPayload): Promise<void> {
    await Notification.create({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      reference_id: payload.reference_id ?? null,
      reference_type: payload.reference_type ?? null,
    });

    try {
      const user = await User.findByPk(payload.user_id, { attributes: ['fcm_token'] });
      if (user?.fcm_token) {
        await this.sendFCMNotification(user.fcm_token, payload.title, payload.body);
      }
    } catch (err) {
      logger.warn(`FCM push failed for user ${payload.user_id}:`, err);
    }
  }

  async sendToMany(userIds: number[], payload: Omit<SendNotificationPayload, 'user_id'>): Promise<void> {
    await Promise.allSettled(userIds.map((id) => this.send({ ...payload, user_id: id })));
  }

  // ── Low-level FCM senders ─────────────────────────────────────────────────

  /** Display-only notification (title + body visible in tray). */
  private async sendFCMNotification(token: string, title: string, body: string): Promise<void> {
    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    logger.info(`[FCM] Notification → token ${token.substring(0, 10)}...: ${title}`);
  }

  /**
   * Data-only message — silent, no tray entry.
   * Works reliably only when the app is in the foreground.
   * Use sendFCMCombined when the app may be killed.
   */
  private async sendFCMData(tokens: string[], data: Record<string, string>): Promise<void> {
    if (tokens.length === 0) return;
    const base = {
      data,
      android: { priority: 'high' as const },
      apns: { payload: { aps: { contentAvailable: true } } },
    };
    if (tokens.length === 1) {
      await admin.messaging().send({ token: tokens[0], ...base });
    } else {
      await admin.messaging().sendEachForMulticast({ tokens, ...base });
    }
    logger.info(`[FCM] Data msg type=${data.type} → ${tokens.length} token(s)`);
  }

  /**
   * Combined notification + data in one FCM message.
   * The OS delivers the tray notification even on a killed app,
   * and the data payload is available when the app opens.
   * Use this for security staff so they are always reached.
   */
  private async sendFCMCombined(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string>,
  ): Promise<void> {
    if (tokens.length === 0) return;
    const base = {
      notification: { title, body },
      data,
      android: { priority: 'high' as const, notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default', contentAvailable: true } } },
    };
    if (tokens.length === 1) {
      await admin.messaging().send({ token: tokens[0], ...base });
    } else {
      await admin.messaging().sendEachForMulticast({ tokens, ...base });
    }
    logger.info(`[FCM] Combined msg type=${data.type} → ${tokens.length} token(s): ${title}`);
  }

  // ── Public data-message helpers (residents) ───────────────────────────────

  /** Silent data message to a single resident — use when app is expected open. */
  async sendDataToUser(userId: number, data: Record<string, string>): Promise<void> {
    try {
      const user = await User.findByPk(userId, { attributes: ['fcm_token'] });
      if (user?.fcm_token) await this.sendFCMData([user.fcm_token], data);
    } catch (err) {
      logger.warn(`[FCM] sendDataToUser failed for user ${userId}:`, err);
    }
  }

  // ── Public combined-message helpers (security staff) ─────────────────────
  // Security staff may have their app killed, so we always send notification+data
  // together so the OS guarantees tray delivery regardless of app state.

  /** Combined notification+data to a single security staff member. */
  async sendAlertToStaff(
    staffId: number,
    title: string,
    body: string,
    data: Record<string, string>,
  ): Promise<void> {
    try {
      const staff = await Staff.unscoped().findByPk(staffId, { attributes: ['fcm_token'] });
      if (!staff) {
        logger.warn(`[FCM] sendAlertToStaff: staff_id=${staffId} not found`);
        return;
      }
      if (!staff.fcm_token) {
        logger.warn(`[FCM] sendAlertToStaff: staff_id=${staffId} has no FCM token — notification not sent`);
        return;
      }
      await this.sendFCMCombined([staff.fcm_token], title, body, data);
    } catch (err) {
      logger.warn(`[FCM] sendAlertToStaff failed for staff ${staffId}:`, err);
    }
  }

  /** Combined notification+data to ALL active security staff in a society. */
  async sendAlertToSocietySecurity(
    societyId: number,
    title: string,
    body: string,
    data: Record<string, string>,
  ): Promise<void> {
    try {
      const staffList = await Staff.findAll({
        where: { society_id: societyId, is_active: true },
        attributes: ['fcm_token'],
      });
      const tokens = staffList.map((s) => s.fcm_token).filter((t): t is string => !!t);
      if (tokens.length > 0) await this.sendFCMCombined(tokens, title, body, data);
    } catch (err) {
      logger.warn(`[FCM] sendAlertToSocietySecurity failed for society ${societyId}:`, err);
    }
  }

  // ── Notification inbox ────────────────────────────────────────────────────
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

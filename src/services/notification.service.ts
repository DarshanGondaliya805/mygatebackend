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
  // Pass { skipPush: true } when a data-only FCM message is already being sent
  // for the same event, so the resident doesn't get two tray notifications —
  // the DB record is still created for the in-app notification inbox.
  async send(payload: SendNotificationPayload, options?: { skipPush?: boolean }): Promise<void> {
    await Notification.create({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      reference_id: payload.reference_id ?? null,
      reference_type: payload.reference_type ?? null,
    });

    if (options?.skipPush) return;

    try {
      const user = await User.findByPk(payload.user_id, { attributes: ['fcm_token'] });
      if (user?.fcm_token) {
        await this.sendFCMNotification(user.fcm_token, payload.title, payload.body);
      }
    } catch (err) {
      logger.warn(`FCM push failed for user ${payload.user_id}:`, err);
    }
  }

  async sendToMany(
    userIds: number[],
    payload: Omit<SendNotificationPayload, 'user_id'>,
    options?: { skipPush?: boolean },
  ): Promise<void> {
    await Promise.allSettled(userIds.map((id) => this.send({ ...payload, user_id: id }, options)));
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
    // ── This log tells us exactly how many FCM sends happen per request ──────
    logger.info(`[FCM][sendFCMData] called — type=${data.type} tokens=${tokens.length} stack=${new Error().stack?.split('\n')[2]?.trim()}`);
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
    logger.info(`[FCM][sendFCMData] ✅ sent type=${data.type} → ${tokens.length} token(s)`);
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

  /**
   * Data-only message to a single security staff member.
   * We send data-only (no notification field) so the OS does NOT auto-display
   * a system tray notification. The app's onMessage / onBackgroundMessage handler
   * shows exactly ONE local notification — preventing the 3× duplicate that happens
   * when notification+data are combined (system tray + background handler + foreground handler).
   * title and body are passed inside the data payload so the app can use them.
   */
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
      // Include title + body inside data so the app can display them in the local notification
      const payload = { ...data, title, body };
      await this.sendFCMData([staff.fcm_token], payload);
      logger.info(`[FCM] Data-only alert → staff_id=${staffId}: ${title}`);
    } catch (err) {
      logger.warn(`[FCM] sendAlertToStaff failed for staff ${staffId}:`, err);
    }
  }

  /**
   * Data-only message to ALL active security staff in a society.
   * Same reasoning as sendAlertToStaff — data-only prevents 3× duplicate notifications.
   */
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
      // Deduplicate tokens — same device logged in under multiple accounts gets only 1 message
      const tokens = [...new Set(
        staffList.map((s) => s.fcm_token).filter((t): t is string => !!t)
      )];
      if (tokens.length > 0) {
        const payload = { ...data, title, body };
        await this.sendFCMData(tokens, payload);
        logger.info(`[FCM] Data-only alert → ${tokens.length} security token(s) in society ${societyId}: ${title}`);
      } else {
        logger.warn(`[FCM] sendAlertToSocietySecurity: no active tokens for society ${societyId}`);
      }
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

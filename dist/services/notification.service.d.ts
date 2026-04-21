import { Notification } from '../models';
import { NotificationType } from '../models/Notification';
interface SendNotificationPayload {
    user_id: number;
    title: string;
    body: string;
    type: NotificationType;
    reference_id?: number;
    reference_type?: string;
}
export declare class NotificationService {
    send(payload: SendNotificationPayload): Promise<void>;
    sendToMany(userIds: number[], payload: Omit<SendNotificationPayload, 'user_id'>): Promise<void>;
    private sendFCM;
    getAll(userId: number, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        rows: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markOneRead(notificationId: number, userId: number): Promise<boolean>;
    markAllRead(userId: number): Promise<void>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map
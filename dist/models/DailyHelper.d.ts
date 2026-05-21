import { Model, Sequelize, Optional } from 'sequelize';
export type HelperType = 'milkman' | 'laundry' | 'newspaper' | 'cook' | 'maid' | 'driver' | 'other';
export interface DailyHelperAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image?: string | null;
    helper_type: HelperType;
    user_id: number;
    flat_id: number;
    society_id: number;
    allowed_days?: string[] | null;
    allowed_time_start?: string | null;
    allowed_time_end?: string | null;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface DailyHelperCreationAttributes extends Optional<DailyHelperAttributes, 'id' | 'uuid' | 'image' | 'allowed_days' | 'allowed_time_start' | 'allowed_time_end' | 'is_active'> {
}
export declare class DailyHelper extends Model<DailyHelperAttributes, DailyHelperCreationAttributes> implements DailyHelperAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image: string | null;
    helper_type: HelperType;
    user_id: number;
    flat_id: number;
    society_id: number;
    allowed_days: string[] | null;
    allowed_time_start: string | null;
    allowed_time_end: string | null;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly entryLogs?: any[];
    static initModel(sequelize: Sequelize): typeof DailyHelper;
}
export interface HelperEntryLogAttributes {
    id: number;
    uuid: string;
    daily_helper_id: number;
    society_id: number;
    in_time: Date;
    out_time?: Date | null;
    created_by?: number | null;
    created_by_staff?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface HelperEntryLogCreationAttributes extends Optional<HelperEntryLogAttributes, 'id' | 'uuid' | 'out_time' | 'created_by' | 'created_by_staff'> {
}
export declare class HelperEntryLog extends Model<HelperEntryLogAttributes, HelperEntryLogCreationAttributes> implements HelperEntryLogAttributes {
    id: number;
    uuid: string;
    daily_helper_id: number;
    society_id: number;
    in_time: Date;
    out_time: Date | null;
    created_by: number | null;
    created_by_staff: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly helper?: any;
    static initModel(sequelize: Sequelize): typeof HelperEntryLog;
}
export type ComplaintCategory = 'maintenance' | 'noise' | 'parking' | 'cleanliness' | 'security' | 'water' | 'electricity' | 'lift' | 'other';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export interface ComplaintAttributes {
    id: number;
    uuid: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    images?: string[] | null;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    admin_note?: string | null;
    raised_by: number;
    assigned_to?: number | null;
    flat_id?: number | null;
    society_id: number;
    resolved_at?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface ComplaintCreationAttributes extends Optional<ComplaintAttributes, 'id' | 'uuid' | 'images' | 'status' | 'priority' | 'admin_note' | 'assigned_to' | 'flat_id' | 'resolved_at'> {
}
export declare class Complaint extends Model<ComplaintAttributes, ComplaintCreationAttributes> implements ComplaintAttributes {
    id: number;
    uuid: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    images: string[] | null;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    admin_note: string | null;
    raised_by: number;
    assigned_to: number | null;
    flat_id: number | null;
    society_id: number;
    resolved_at: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly raisedBy?: any;
    readonly assignedTo?: any;
    static initModel(sequelize: Sequelize): typeof Complaint;
}
export type EventCategory = 'festival' | 'meeting' | 'sports' | 'cultural' | 'maintenance' | 'emergency' | 'other';
export interface EventAttributes {
    id: number;
    uuid: string;
    title: string;
    description?: string | null;
    image?: string | null;
    venue?: string | null;
    start_time: Date;
    end_time?: Date | null;
    category: EventCategory;
    society_id: number;
    created_by: number;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'uuid' | 'description' | 'image' | 'venue' | 'end_time' | 'category' | 'is_active'> {
}
export declare class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    image: string | null;
    venue: string | null;
    start_time: Date;
    end_time: Date | null;
    category: EventCategory;
    society_id: number;
    created_by: number;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static initModel(sequelize: Sequelize): typeof Event;
}
export type ServiceType = 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'pest_control' | 'ac_repair' | 'appliance_repair' | 'furniture' | 'other';
export interface ServiceContactAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    alternate_phone?: string | null;
    service_type: ServiceType;
    description?: string | null;
    society_id: number;
    created_by: number;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface ServiceContactCreationAttributes extends Optional<ServiceContactAttributes, 'id' | 'uuid' | 'alternate_phone' | 'description' | 'is_active'> {
}
export declare class ServiceContact extends Model<ServiceContactAttributes, ServiceContactCreationAttributes> implements ServiceContactAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    alternate_phone: string | null;
    service_type: ServiceType;
    description: string | null;
    society_id: number;
    created_by: number;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static initModel(sequelize: Sequelize): typeof ServiceContact;
}
export type NotificationType = 'visitor_request' | 'visitor_approved' | 'visitor_rejected' | 'complaint_update' | 'event' | 'announcement' | 'approval_request' | 'other';
export interface NotificationAttributes {
    id: number;
    uuid: string;
    user_id: number;
    title: string;
    body: string;
    type: NotificationType;
    reference_id?: number | null;
    reference_type?: string | null;
    is_read: boolean;
    read_at?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'uuid' | 'reference_id' | 'reference_type' | 'is_read' | 'read_at'> {
}
export declare class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    id: number;
    uuid: string;
    user_id: number;
    title: string;
    body: string;
    type: NotificationType;
    reference_id: number | null;
    reference_type: string | null;
    is_read: boolean;
    read_at: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static initModel(sequelize: Sequelize): typeof Notification;
}
//# sourceMappingURL=DailyHelper.d.ts.map
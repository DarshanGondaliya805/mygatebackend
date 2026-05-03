import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// ─── DailyHelper ─────────────────────────────────────────────────────────────
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

export interface DailyHelperCreationAttributes
  extends Optional<DailyHelperAttributes, 'id' | 'uuid' | 'image' | 'allowed_days' | 'allowed_time_start' | 'allowed_time_end' | 'is_active'> {}

export class DailyHelper
  extends Model<DailyHelperAttributes, DailyHelperCreationAttributes>
  implements DailyHelperAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public phone!: string;
  public image!: string | null;
  public helper_type!: HelperType;
  public user_id!: number;
  public flat_id!: number;
  public society_id!: number;
  public allowed_days!: string[] | null;
  public allowed_time_start!: string | null;
  public allowed_time_end!: string | null;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly entryLogs?: any[];

  static initModel(sequelize: Sequelize): typeof DailyHelper {
    DailyHelper.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(15), allowNull: false },
        image: { type: DataTypes.STRING(255), allowNull: true },
        helper_type: {
          type: DataTypes.ENUM('milkman', 'laundry', 'newspaper', 'cook', 'maid', 'driver', 'other'),
          allowNull: false,
        },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        flat_id: { type: DataTypes.INTEGER, allowNull: false },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        allowed_days: { type: DataTypes.JSON, allowNull: true },
        allowed_time_start: { type: DataTypes.TIME, allowNull: true },
        allowed_time_end: { type: DataTypes.TIME, allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      { sequelize, tableName: 'daily_helpers', paranoid: true, timestamps: true }
    );
    return DailyHelper;
  }
}

// ─── HelperEntryLog ───────────────────────────────────────────────────────────
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

export interface HelperEntryLogCreationAttributes
  extends Optional<HelperEntryLogAttributes, 'id' | 'uuid' | 'out_time' | 'created_by' | 'created_by_staff'> {}

export class HelperEntryLog
  extends Model<HelperEntryLogAttributes, HelperEntryLogCreationAttributes>
  implements HelperEntryLogAttributes
{
  public id!: number;
  public uuid!: string;
  public daily_helper_id!: number;
  public society_id!: number;
  public in_time!: Date;
  public out_time!: Date | null;
  public created_by!: number | null;
  public created_by_staff!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly helper?: any;

  static initModel(sequelize: Sequelize): typeof HelperEntryLog {
    HelperEntryLog.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        daily_helper_id: { type: DataTypes.INTEGER, allowNull: false },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        in_time: { type: DataTypes.DATE, allowNull: false },
        out_time: { type: DataTypes.DATE, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        created_by_staff: { type: DataTypes.INTEGER, allowNull: true },
      },
      { sequelize, tableName: 'helper_entry_logs', paranoid: true, timestamps: true }
    );
    return HelperEntryLog;
  }
}

// ─── Complaint ────────────────────────────────────────────────────────────────
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

export interface ComplaintCreationAttributes
  extends Optional<ComplaintAttributes, 'id' | 'uuid' | 'images' | 'status' | 'priority' | 'admin_note' | 'assigned_to' | 'flat_id' | 'resolved_at'> {}

export class Complaint
  extends Model<ComplaintAttributes, ComplaintCreationAttributes>
  implements ComplaintAttributes
{
  public id!: number;
  public uuid!: string;
  public title!: string;
  public description!: string;
  public category!: ComplaintCategory;
  public images!: string[] | null;
  public status!: ComplaintStatus;
  public priority!: ComplaintPriority;
  public admin_note!: string | null;
  public raised_by!: number;
  public assigned_to!: number | null;
  public flat_id!: number | null;
  public society_id!: number;
  public resolved_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly raisedBy?: any;
  public readonly assignedTo?: any;

  static initModel(sequelize: Sequelize): typeof Complaint {
    Complaint.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        title: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        category: {
          type: DataTypes.ENUM('maintenance', 'noise', 'parking', 'cleanliness', 'security', 'water', 'electricity', 'lift', 'other'),
          defaultValue: 'other',
        },
        images: { type: DataTypes.JSON, allowNull: true },
        status: {
          type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'rejected'),
          defaultValue: 'open',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
          defaultValue: 'medium',
        },
        admin_note: { type: DataTypes.TEXT, allowNull: true },
        raised_by: { type: DataTypes.INTEGER, allowNull: false },
        assigned_to: { type: DataTypes.INTEGER, allowNull: true },
        flat_id: { type: DataTypes.INTEGER, allowNull: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        resolved_at: { type: DataTypes.DATE, allowNull: true },
      },
      { sequelize, tableName: 'complaints', paranoid: true, timestamps: true }
    );
    return Complaint;
  }
}

// ─── Event ────────────────────────────────────────────────────────────────────
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

export interface EventCreationAttributes
  extends Optional<EventAttributes, 'id' | 'uuid' | 'description' | 'image' | 'venue' | 'end_time' | 'category' | 'is_active'> {}

export class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  public id!: number;
  public uuid!: string;
  public title!: string;
  public description!: string | null;
  public image!: string | null;
  public venue!: string | null;
  public start_time!: Date;
  public end_time!: Date | null;
  public category!: EventCategory;
  public society_id!: number;
  public created_by!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof Event {
    Event.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        title: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        image: { type: DataTypes.STRING(255), allowNull: true },
        venue: { type: DataTypes.STRING(200), allowNull: true },
        start_time: { type: DataTypes.DATE, allowNull: false },
        end_time: { type: DataTypes.DATE, allowNull: true },
        category: {
          type: DataTypes.ENUM('festival', 'meeting', 'sports', 'cultural', 'maintenance', 'emergency', 'other'),
          defaultValue: 'other',
        },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      { sequelize, tableName: 'events', paranoid: true, timestamps: true }
    );
    return Event;
  }
}

// ─── ServiceContact ───────────────────────────────────────────────────────────
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

export interface ServiceContactCreationAttributes
  extends Optional<ServiceContactAttributes, 'id' | 'uuid' | 'alternate_phone' | 'description' | 'is_active'> {}

export class ServiceContact
  extends Model<ServiceContactAttributes, ServiceContactCreationAttributes>
  implements ServiceContactAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public phone!: string;
  public alternate_phone!: string | null;
  public service_type!: ServiceType;
  public description!: string | null;
  public society_id!: number;
  public created_by!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof ServiceContact {
    ServiceContact.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(15), allowNull: false },
        alternate_phone: { type: DataTypes.STRING(15), allowNull: true },
        service_type: {
          type: DataTypes.ENUM('plumber', 'electrician', 'carpenter', 'painter', 'pest_control', 'ac_repair', 'appliance_repair', 'furniture', 'other'),
          allowNull: false,
        },
        description: { type: DataTypes.TEXT, allowNull: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      { sequelize, tableName: 'service_contacts', paranoid: true, timestamps: true }
    );
    return ServiceContact;
  }
}

// ─── Notification ─────────────────────────────────────────────────────────────
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

export interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'uuid' | 'reference_id' | 'reference_type' | 'is_read' | 'read_at'> {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public uuid!: string;
  public user_id!: number;
  public title!: string;
  public body!: string;
  public type!: NotificationType;
  public reference_id!: number | null;
  public reference_type!: string | null;
  public is_read!: boolean;
  public read_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof Notification {
    Notification.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING(200), allowNull: false },
        body: { type: DataTypes.TEXT, allowNull: false },
        type: {
          type: DataTypes.ENUM('visitor_request', 'visitor_approved', 'visitor_rejected', 'complaint_update', 'event', 'announcement', 'approval_request', 'other'),
          defaultValue: 'other',
        },
        reference_id: { type: DataTypes.INTEGER, allowNull: true },
        reference_type: { type: DataTypes.STRING(50), allowNull: true },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        read_at: { type: DataTypes.DATE, allowNull: true },
      },
      { sequelize, tableName: 'notifications', paranoid: true, timestamps: true }
    );
    return Notification;
  }
}

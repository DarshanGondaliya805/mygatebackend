import { Sequelize } from 'sequelize';
import sequelize from '../config/db';

// Import all models
import { User } from './User';
import { Society } from './Society';
import { Block } from './Block';
import { Flat } from './Flat';
import { SocietyPolicy } from './SocietyPolicy';
import { Amenity } from './Amenity';
import { Staff } from './Staff';
import { Visitor } from './Visitor';
import { VisitorLog } from './VisitorLog';
import { DailyHelper } from './DailyHelper';
import { HelperEntryLog } from './HelperEntryLog';
import { Complaint } from './Complaint';
import { Event } from './Event';
import { ServiceContact } from './ServiceContact';
import { Notification } from './Notification';

// Initialize all models
User.initModel(sequelize);
Society.initModel(sequelize);
Block.initModel(sequelize);
Flat.initModel(sequelize);
SocietyPolicy.initModel(sequelize);
Amenity.initModel(sequelize);
Staff.initModel(sequelize);
Visitor.initModel(sequelize);
VisitorLog.initModel(sequelize);
DailyHelper.initModel(sequelize);
HelperEntryLog.initModel(sequelize);
Complaint.initModel(sequelize);
Event.initModel(sequelize);
ServiceContact.initModel(sequelize);
Notification.initModel(sequelize);

// ─── Associations ────────────────────────────────────────────────────────────

// Society <-> User
Society.hasMany(User, { foreignKey: 'society_id', as: 'members' });
User.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Society <-> Block
Society.hasMany(Block, { foreignKey: 'society_id', as: 'blocks' });
Block.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Block <-> Flat
Block.hasMany(Flat, { foreignKey: 'block_id', as: 'flats' });
Flat.belongsTo(Block, { foreignKey: 'block_id', as: 'block' });

// Society <-> Flat
Society.hasMany(Flat, { foreignKey: 'society_id', as: 'flats' });
Flat.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Flat <-> User (resident)
Flat.hasMany(User, { foreignKey: 'flat_id', as: 'residents' });
User.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });

// Society <-> SocietyPolicy
Society.hasMany(SocietyPolicy, { foreignKey: 'society_id', as: 'policies' });
SocietyPolicy.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Society <-> Amenity
Society.hasMany(Amenity, { foreignKey: 'society_id', as: 'amenities' });
Amenity.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Society <-> Staff
Society.hasMany(Staff, { foreignKey: 'society_id', as: 'staffMembers' });
Staff.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Visitor profile associations
Society.hasMany(Visitor, { foreignKey: 'society_id', as: 'visitors' });
Visitor.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// VisitorLog associations
Visitor.hasMany(VisitorLog, { foreignKey: 'visitor_id', as: 'logs' });
VisitorLog.belongsTo(Visitor, { foreignKey: 'visitor_id', as: 'visitor' });
Flat.hasMany(VisitorLog, { foreignKey: 'flat_id', as: 'visitorLogs' });
VisitorLog.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });
Society.hasMany(VisitorLog, { foreignKey: 'society_id', as: 'visitorLogs' });
VisitorLog.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });
User.hasMany(VisitorLog, { foreignKey: 'host_user_id', as: 'hostedVisitorLogs' });
VisitorLog.belongsTo(User, { foreignKey: 'host_user_id', as: 'host' });
User.hasMany(VisitorLog, { foreignKey: 'created_by', as: 'createdVisitorLogs' });
VisitorLog.belongsTo(User, { foreignKey: 'created_by', as: 'createdByUser' });
Staff.hasMany(VisitorLog, { foreignKey: 'created_by_staff', as: 'visitorLogs' });
VisitorLog.belongsTo(Staff, { foreignKey: 'created_by_staff', as: 'createdByStaff' });

// DailyHelper associations
User.hasMany(DailyHelper, { foreignKey: 'user_id', as: 'dailyHelpers' });
DailyHelper.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Flat.hasMany(DailyHelper, { foreignKey: 'flat_id', as: 'dailyHelpers' });
DailyHelper.belongsTo(Flat, { foreignKey: 'flat_id', as: 'flat' });
Society.hasMany(DailyHelper, { foreignKey: 'society_id', as: 'dailyHelpers' });
DailyHelper.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// HelperEntryLog associations
DailyHelper.hasMany(HelperEntryLog, { foreignKey: 'daily_helper_id', as: 'entryLogs' });
HelperEntryLog.belongsTo(DailyHelper, { foreignKey: 'daily_helper_id', as: 'helper' });

// Complaint associations
User.hasMany(Complaint, { foreignKey: 'raised_by', as: 'complaints' });
Complaint.belongsTo(User, { foreignKey: 'raised_by', as: 'raisedBy' });
User.hasMany(Complaint, { foreignKey: 'assigned_to', as: 'assignedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedTo' });
Society.hasMany(Complaint, { foreignKey: 'society_id', as: 'complaints' });
Complaint.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Event associations
Society.hasMany(Event, { foreignKey: 'society_id', as: 'events' });
Event.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });
User.hasMany(Event, { foreignKey: 'created_by', as: 'events' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

// ServiceContact associations
Society.hasMany(ServiceContact, { foreignKey: 'society_id', as: 'serviceContacts' });
ServiceContact.belongsTo(Society, { foreignKey: 'society_id', as: 'society' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  Sequelize,
  User,
  Society,
  Block,
  Flat,
  SocietyPolicy,
  Amenity,
  Staff,
  Visitor,
  VisitorLog,
  DailyHelper,
  HelperEntryLog,
  Complaint,
  Event,
  ServiceContact,
  Notification,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.ServiceContact = exports.Event = exports.Complaint = exports.HelperEntryLog = exports.DailyHelper = exports.VisitorLog = exports.Visitor = exports.Staff = exports.Amenity = exports.SocietyPolicy = exports.Flat = exports.Block = exports.Society = exports.User = exports.Sequelize = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const db_1 = __importDefault(require("../config/db"));
exports.sequelize = db_1.default;
// Import all models
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Society_1 = require("./Society");
Object.defineProperty(exports, "Society", { enumerable: true, get: function () { return Society_1.Society; } });
const Block_1 = require("./Block");
Object.defineProperty(exports, "Block", { enumerable: true, get: function () { return Block_1.Block; } });
const Flat_1 = require("./Flat");
Object.defineProperty(exports, "Flat", { enumerable: true, get: function () { return Flat_1.Flat; } });
const SocietyPolicy_1 = require("./SocietyPolicy");
Object.defineProperty(exports, "SocietyPolicy", { enumerable: true, get: function () { return SocietyPolicy_1.SocietyPolicy; } });
const Amenity_1 = require("./Amenity");
Object.defineProperty(exports, "Amenity", { enumerable: true, get: function () { return Amenity_1.Amenity; } });
const Staff_1 = require("./Staff");
Object.defineProperty(exports, "Staff", { enumerable: true, get: function () { return Staff_1.Staff; } });
const Visitor_1 = require("./Visitor");
Object.defineProperty(exports, "Visitor", { enumerable: true, get: function () { return Visitor_1.Visitor; } });
const VisitorLog_1 = require("./VisitorLog");
Object.defineProperty(exports, "VisitorLog", { enumerable: true, get: function () { return VisitorLog_1.VisitorLog; } });
const DailyHelper_1 = require("./DailyHelper");
Object.defineProperty(exports, "DailyHelper", { enumerable: true, get: function () { return DailyHelper_1.DailyHelper; } });
const HelperEntryLog_1 = require("./HelperEntryLog");
Object.defineProperty(exports, "HelperEntryLog", { enumerable: true, get: function () { return HelperEntryLog_1.HelperEntryLog; } });
const Complaint_1 = require("./Complaint");
Object.defineProperty(exports, "Complaint", { enumerable: true, get: function () { return Complaint_1.Complaint; } });
const Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return Event_1.Event; } });
const ServiceContact_1 = require("./ServiceContact");
Object.defineProperty(exports, "ServiceContact", { enumerable: true, get: function () { return ServiceContact_1.ServiceContact; } });
const Notification_1 = require("./Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
// Initialize all models
User_1.User.initModel(db_1.default);
Society_1.Society.initModel(db_1.default);
Block_1.Block.initModel(db_1.default);
Flat_1.Flat.initModel(db_1.default);
SocietyPolicy_1.SocietyPolicy.initModel(db_1.default);
Amenity_1.Amenity.initModel(db_1.default);
Staff_1.Staff.initModel(db_1.default);
Visitor_1.Visitor.initModel(db_1.default);
VisitorLog_1.VisitorLog.initModel(db_1.default);
DailyHelper_1.DailyHelper.initModel(db_1.default);
HelperEntryLog_1.HelperEntryLog.initModel(db_1.default);
Complaint_1.Complaint.initModel(db_1.default);
Event_1.Event.initModel(db_1.default);
ServiceContact_1.ServiceContact.initModel(db_1.default);
Notification_1.Notification.initModel(db_1.default);
// ─── Associations ────────────────────────────────────────────────────────────
// Society <-> User
Society_1.Society.hasMany(User_1.User, { foreignKey: 'society_id', as: 'members' });
User_1.User.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Society <-> Block
Society_1.Society.hasMany(Block_1.Block, { foreignKey: 'society_id', as: 'blocks' });
Block_1.Block.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Block <-> Flat
Block_1.Block.hasMany(Flat_1.Flat, { foreignKey: 'block_id', as: 'flats' });
Flat_1.Flat.belongsTo(Block_1.Block, { foreignKey: 'block_id', as: 'block' });
// Society <-> Flat
Society_1.Society.hasMany(Flat_1.Flat, { foreignKey: 'society_id', as: 'flats' });
Flat_1.Flat.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Flat <-> User (resident)
Flat_1.Flat.hasMany(User_1.User, { foreignKey: 'flat_id', as: 'residents' });
User_1.User.belongsTo(Flat_1.Flat, { foreignKey: 'flat_id', as: 'flat' });
// Society <-> SocietyPolicy
Society_1.Society.hasMany(SocietyPolicy_1.SocietyPolicy, { foreignKey: 'society_id', as: 'policies' });
SocietyPolicy_1.SocietyPolicy.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Society <-> Amenity
Society_1.Society.hasMany(Amenity_1.Amenity, { foreignKey: 'society_id', as: 'amenities' });
Amenity_1.Amenity.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Society <-> Staff
Society_1.Society.hasMany(Staff_1.Staff, { foreignKey: 'society_id', as: 'staffMembers' });
Staff_1.Staff.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Visitor profile associations
Society_1.Society.hasMany(Visitor_1.Visitor, { foreignKey: 'society_id', as: 'visitors' });
Visitor_1.Visitor.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// VisitorLog associations
Visitor_1.Visitor.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'visitor_id', as: 'logs' });
VisitorLog_1.VisitorLog.belongsTo(Visitor_1.Visitor, { foreignKey: 'visitor_id', as: 'visitor' });
Flat_1.Flat.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'flat_id', as: 'visitorLogs' });
VisitorLog_1.VisitorLog.belongsTo(Flat_1.Flat, { foreignKey: 'flat_id', as: 'flat' });
Society_1.Society.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'society_id', as: 'visitorLogs' });
VisitorLog_1.VisitorLog.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
User_1.User.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'host_user_id', as: 'hostedVisitorLogs' });
VisitorLog_1.VisitorLog.belongsTo(User_1.User, { foreignKey: 'host_user_id', as: 'host' });
User_1.User.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'created_by', as: 'createdVisitorLogs' });
VisitorLog_1.VisitorLog.belongsTo(User_1.User, { foreignKey: 'created_by', as: 'createdByUser' });
Staff_1.Staff.hasMany(VisitorLog_1.VisitorLog, { foreignKey: 'created_by_staff', as: 'visitorLogs' });
VisitorLog_1.VisitorLog.belongsTo(Staff_1.Staff, { foreignKey: 'created_by_staff', as: 'createdByStaff' });
// DailyHelper associations
User_1.User.hasMany(DailyHelper_1.DailyHelper, { foreignKey: 'user_id', as: 'dailyHelpers' });
DailyHelper_1.DailyHelper.belongsTo(User_1.User, { foreignKey: 'user_id', as: 'user' });
Flat_1.Flat.hasMany(DailyHelper_1.DailyHelper, { foreignKey: 'flat_id', as: 'dailyHelpers' });
DailyHelper_1.DailyHelper.belongsTo(Flat_1.Flat, { foreignKey: 'flat_id', as: 'flat' });
Society_1.Society.hasMany(DailyHelper_1.DailyHelper, { foreignKey: 'society_id', as: 'dailyHelpers' });
DailyHelper_1.DailyHelper.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// HelperEntryLog associations
DailyHelper_1.DailyHelper.hasMany(HelperEntryLog_1.HelperEntryLog, { foreignKey: 'daily_helper_id', as: 'entryLogs' });
HelperEntryLog_1.HelperEntryLog.belongsTo(DailyHelper_1.DailyHelper, { foreignKey: 'daily_helper_id', as: 'helper' });
Staff_1.Staff.hasMany(HelperEntryLog_1.HelperEntryLog, { foreignKey: 'created_by_staff', as: 'helperEntryLogs' });
HelperEntryLog_1.HelperEntryLog.belongsTo(Staff_1.Staff, { foreignKey: 'created_by_staff', as: 'createdByStaff' });
// Complaint associations
User_1.User.hasMany(Complaint_1.Complaint, { foreignKey: 'raised_by', as: 'complaints' });
Complaint_1.Complaint.belongsTo(User_1.User, { foreignKey: 'raised_by', as: 'raisedBy' });
User_1.User.hasMany(Complaint_1.Complaint, { foreignKey: 'assigned_to', as: 'assignedComplaints' });
Complaint_1.Complaint.belongsTo(User_1.User, { foreignKey: 'assigned_to', as: 'assignedTo' });
Society_1.Society.hasMany(Complaint_1.Complaint, { foreignKey: 'society_id', as: 'complaints' });
Complaint_1.Complaint.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Event associations
Society_1.Society.hasMany(Event_1.Event, { foreignKey: 'society_id', as: 'events' });
Event_1.Event.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
User_1.User.hasMany(Event_1.Event, { foreignKey: 'created_by', as: 'events' });
Event_1.Event.belongsTo(User_1.User, { foreignKey: 'created_by', as: 'createdBy' });
// ServiceContact associations
Society_1.Society.hasMany(ServiceContact_1.ServiceContact, { foreignKey: 'society_id', as: 'serviceContacts' });
ServiceContact_1.ServiceContact.belongsTo(Society_1.Society, { foreignKey: 'society_id', as: 'society' });
// Notification associations
User_1.User.hasMany(Notification_1.Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification_1.Notification.belongsTo(User_1.User, { foreignKey: 'user_id', as: 'user' });
//# sourceMappingURL=index.js.map
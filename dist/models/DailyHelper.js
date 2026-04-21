"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.ServiceContact = exports.Event = exports.Complaint = exports.HelperEntryLog = exports.DailyHelper = void 0;
const sequelize_1 = require("sequelize");
class DailyHelper extends sequelize_1.Model {
    static initModel(sequelize) {
        DailyHelper.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            phone: { type: sequelize_1.DataTypes.STRING(15), allowNull: false },
            image: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            helper_type: {
                type: sequelize_1.DataTypes.ENUM('milkman', 'laundry', 'newspaper', 'cook', 'maid', 'driver', 'other'),
                allowNull: false,
            },
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            flat_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            allowed_days: { type: sequelize_1.DataTypes.JSON, allowNull: true },
            allowed_time_start: { type: sequelize_1.DataTypes.TIME, allowNull: true },
            allowed_time_end: { type: sequelize_1.DataTypes.TIME, allowNull: true },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
        }, { sequelize, tableName: 'daily_helpers', paranoid: true, timestamps: true });
        return DailyHelper;
    }
}
exports.DailyHelper = DailyHelper;
class HelperEntryLog extends sequelize_1.Model {
    static initModel(sequelize) {
        HelperEntryLog.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            daily_helper_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            in_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            out_time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        }, { sequelize, tableName: 'helper_entry_logs', timestamps: true });
        return HelperEntryLog;
    }
}
exports.HelperEntryLog = HelperEntryLog;
class Complaint extends sequelize_1.Model {
    static initModel(sequelize) {
        Complaint.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            title: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
            description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
            category: {
                type: sequelize_1.DataTypes.ENUM('maintenance', 'noise', 'parking', 'cleanliness', 'security', 'water', 'electricity', 'lift', 'other'),
                defaultValue: 'other',
            },
            images: { type: sequelize_1.DataTypes.JSON, allowNull: true },
            status: {
                type: sequelize_1.DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'rejected'),
                defaultValue: 'open',
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
                defaultValue: 'medium',
            },
            admin_note: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            raised_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            assigned_to: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            flat_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            resolved_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        }, { sequelize, tableName: 'complaints', paranoid: true, timestamps: true });
        return Complaint;
    }
}
exports.Complaint = Complaint;
class Event extends sequelize_1.Model {
    static initModel(sequelize) {
        Event.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            title: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
            description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            image: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            venue: { type: sequelize_1.DataTypes.STRING(200), allowNull: true },
            start_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            end_time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            category: {
                type: sequelize_1.DataTypes.ENUM('festival', 'meeting', 'sports', 'cultural', 'maintenance', 'emergency', 'other'),
                defaultValue: 'other',
            },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
        }, { sequelize, tableName: 'events', paranoid: true, timestamps: true });
        return Event;
    }
}
exports.Event = Event;
class ServiceContact extends sequelize_1.Model {
    static initModel(sequelize) {
        ServiceContact.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            phone: { type: sequelize_1.DataTypes.STRING(15), allowNull: false },
            alternate_phone: { type: sequelize_1.DataTypes.STRING(15), allowNull: true },
            service_type: {
                type: sequelize_1.DataTypes.ENUM('plumber', 'electrician', 'carpenter', 'painter', 'pest_control', 'ac_repair', 'appliance_repair', 'furniture', 'other'),
                allowNull: false,
            },
            description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
        }, { sequelize, tableName: 'service_contacts', paranoid: true, timestamps: true });
        return ServiceContact;
    }
}
exports.ServiceContact = ServiceContact;
class Notification extends sequelize_1.Model {
    static initModel(sequelize) {
        Notification.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
            body: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
            type: {
                type: sequelize_1.DataTypes.ENUM('visitor_request', 'visitor_approved', 'visitor_rejected', 'complaint_update', 'event', 'announcement', 'approval_request', 'other'),
                defaultValue: 'other',
            },
            reference_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            reference_type: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            is_read: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            read_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        }, { sequelize, tableName: 'notifications', paranoid: true, timestamps: true });
        return Notification;
    }
}
exports.Notification = Notification;
//# sourceMappingURL=DailyHelper.js.map
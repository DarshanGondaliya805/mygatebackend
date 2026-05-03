"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorLog = void 0;
const sequelize_1 = require("sequelize");
class VisitorLog extends sequelize_1.Model {
    static initModel(sequelize) {
        VisitorLog.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            visitor_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            visitor_type: {
                type: sequelize_1.DataTypes.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
                allowNull: false,
                defaultValue: 'guest',
            },
            flat_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            host_user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            created_by_staff: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'checked_out'),
                allowNull: false,
                defaultValue: 'pending',
            },
            purpose: { type: sequelize_1.DataTypes.STRING(200), allowNull: true },
            in_time: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            out_time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            is_pre_approved: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            pre_approved_date: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
        }, {
            sequelize,
            tableName: 'visitor_logs',
            paranoid: true,
            timestamps: true,
        });
        return VisitorLog;
    }
}
exports.VisitorLog = VisitorLog;
exports.default = VisitorLog;
//# sourceMappingURL=VisitorLog.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visitor = void 0;
const sequelize_1 = require("sequelize");
class Visitor extends sequelize_1.Model {
    static initModel(sequelize) {
        Visitor.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            phone: { type: sequelize_1.DataTypes.STRING(15), allowNull: false },
            image: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            visitor_type: {
                type: sequelize_1.DataTypes.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
                allowNull: false,
                defaultValue: 'guest',
            },
            vehicle_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
            flat_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            host_user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'checked_out'),
                defaultValue: 'pending',
            },
            purpose: { type: sequelize_1.DataTypes.STRING(200), allowNull: true },
            in_time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            out_time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
            is_pre_approved: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            pre_approved_date: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
        }, { sequelize, tableName: 'visitors', paranoid: true, timestamps: true });
        return Visitor;
    }
}
exports.Visitor = Visitor;
exports.default = Visitor;
//# sourceMappingURL=Visitor.js.map
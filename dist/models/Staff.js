"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = void 0;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class Staff extends sequelize_1.Model {
    static initModel(sequelize) {
        Staff.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            phone: { type: sequelize_1.DataTypes.STRING(15), allowNull: false },
            email: { type: sequelize_1.DataTypes.STRING(150), allowNull: true },
            image: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            dob: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
            gender: { type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
            staff_type: {
                type: sequelize_1.DataTypes.ENUM('security', 'cleaning', 'gardening', 'maintenance', 'electrician', 'plumber', 'lift_operator', 'other'),
                allowNull: false,
            },
            salary: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: true },
            salary_type: {
                type: sequelize_1.DataTypes.ENUM('monthly', 'daily', 'hourly'),
                defaultValue: 'monthly',
            },
            address: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            documents: { type: sequelize_1.DataTypes.JSON, allowNull: true },
            password: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            joining_date: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        }, {
            sequelize, tableName: 'staff', paranoid: true, timestamps: true,
            defaultScope: { attributes: { exclude: ['password'] } },
            hooks: {
                beforeSave: async (staff) => {
                    if (staff.changed('password') && staff.password) {
                        staff.password = await bcryptjs_1.default.hash(staff.password, 12);
                    }
                },
            },
        });
        return Staff;
    }
}
exports.Staff = Staff;
exports.default = Staff;
//# sourceMappingURL=Staff.js.map
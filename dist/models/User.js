"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    static initModel(sequelize) {
        User.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            uuid: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                unique: true,
                allowNull: false,
            },
            name: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                validate: { notEmpty: true, len: [2, 100] },
            },
            email: {
                type: sequelize_1.DataTypes.STRING(150),
                allowNull: true,
                unique: true,
                validate: { isEmail: true },
            },
            phone: {
                type: sequelize_1.DataTypes.STRING(15),
                allowNull: false,
                unique: true,
                validate: { notEmpty: true },
            },
            password: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
            },
            image: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
            },
            gender: {
                type: sequelize_1.DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true,
            },
            dob: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: true,
            },
            role: {
                type: sequelize_1.DataTypes.ENUM('super_admin', 'admin', 'user', 'security'),
                allowNull: false,
                defaultValue: 'user',
            },
            user_type: {
                type: sequelize_1.DataTypes.ENUM('owner', 'rented'),
                allowNull: true,
            },
            flat_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            society_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            is_approved: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            is_active: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
            },
            fcm_token: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            refresh_token: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            last_login: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'users',
            paranoid: true,
            timestamps: true,
            defaultScope: {
                attributes: { exclude: ['password', 'refresh_token'] },
            },
            scopes: {
                active: { where: { is_active: true, is_approved: true } },
            },
        });
        return User;
    }
}
exports.User = User;
exports.default = User;
//# sourceMappingURL=User.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocietyPolicy = void 0;
const sequelize_1 = require("sequelize");
class SocietyPolicy extends sequelize_1.Model {
    static initModel(sequelize) {
        SocietyPolicy.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            title: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
            description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
            category: {
                type: sequelize_1.DataTypes.ENUM('general', 'parking', 'pets', 'noise', 'maintenance', 'security', 'visitor', 'other'),
                defaultValue: 'general',
            },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            updated_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        }, { sequelize, tableName: 'society_policies', paranoid: true, timestamps: true });
        return SocietyPolicy;
    }
}
exports.SocietyPolicy = SocietyPolicy;
exports.default = SocietyPolicy;
//# sourceMappingURL=SocietyPolicy.js.map
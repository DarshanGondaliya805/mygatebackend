"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amenity = void 0;
const sequelize_1 = require("sequelize");
class Amenity extends sequelize_1.Model {
    static initModel(sequelize) {
        Amenity.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
            description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
            icon: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            image: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            timing_open: { type: sequelize_1.DataTypes.TIME, allowNull: true },
            timing_close: { type: sequelize_1.DataTypes.TIME, allowNull: true },
            category: {
                type: sequelize_1.DataTypes.ENUM('sports', 'fitness', 'leisure', 'kids', 'common', 'other'),
                defaultValue: 'common',
            },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        }, { sequelize, tableName: 'amenities', paranoid: true, timestamps: true });
        return Amenity;
    }
}
exports.Amenity = Amenity;
exports.default = Amenity;
//# sourceMappingURL=Amenity.js.map
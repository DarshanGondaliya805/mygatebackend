"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Flat = void 0;
const sequelize_1 = require("sequelize");
class Flat extends sequelize_1.Model {
    static initModel(sequelize) {
        Flat.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true, allowNull: false },
            flat_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, validate: { notEmpty: true } },
            floor: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            block_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            type: {
                type: sequelize_1.DataTypes.ENUM('1BHK', '2BHK', '3BHK', '4BHK', 'studio', 'penthouse', 'other'),
                allowNull: true,
            },
            is_occupied: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
        }, {
            sequelize,
            tableName: 'flats',
            paranoid: true,
            timestamps: true,
        });
        return Flat;
    }
}
exports.Flat = Flat;
exports.default = Flat;
//# sourceMappingURL=Flat.js.map
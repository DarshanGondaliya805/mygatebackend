"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const sequelize_1 = require("sequelize");
class Block extends sequelize_1.Model {
    static initModel(sequelize) {
        Block.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, validate: { notEmpty: true } },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            total_floors: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
            total_flats: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
        }, {
            sequelize,
            tableName: 'blocks',
            paranoid: true,
            timestamps: true,
        });
        return Block;
    }
}
exports.Block = Block;
exports.default = Block;
//# sourceMappingURL=Block.js.map
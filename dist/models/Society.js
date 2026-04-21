"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Society = void 0;
const sequelize_1 = require("sequelize");
class Society extends sequelize_1.Model {
    static initModel(sequelize) {
        Society.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, unique: true, allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
            location: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
            city: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
            state: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
            pincode: { type: sequelize_1.DataTypes.STRING(10), allowNull: true },
            total_blocks: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
            logo: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
            created_by: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        }, {
            sequelize,
            tableName: 'societies',
            paranoid: true,
            timestamps: true,
        });
        return Society;
    }
}
exports.Society = Society;
exports.default = Society;
//# sourceMappingURL=Society.js.map
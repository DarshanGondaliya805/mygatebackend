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
            vehicle_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
            society_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        }, { sequelize, tableName: 'visitors', paranoid: true, timestamps: true });
        return Visitor;
    }
}
exports.Visitor = Visitor;
exports.default = Visitor;
//# sourceMappingURL=Visitor.js.map
import { Model, Sequelize, Optional } from 'sequelize';
export interface BlockAttributes {
    id: number;
    uuid: string;
    name: string;
    society_id: number;
    total_floors?: number | null;
    total_flats: number;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface BlockCreationAttributes extends Optional<BlockAttributes, 'id' | 'uuid' | 'total_floors' | 'total_flats' | 'is_active'> {
}
export declare class Block extends Model<BlockAttributes, BlockCreationAttributes> implements BlockAttributes {
    id: number;
    uuid: string;
    name: string;
    society_id: number;
    total_floors: number | null;
    total_flats: number;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly flats?: any[];
    readonly society?: any;
    static initModel(sequelize: Sequelize): typeof Block;
}
export default Block;
//# sourceMappingURL=Block.d.ts.map
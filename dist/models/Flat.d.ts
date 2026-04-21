import { Model, Sequelize, Optional } from 'sequelize';
export type FlatType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'studio' | 'penthouse' | 'other';
export interface FlatAttributes {
    id: number;
    uuid: string;
    flat_number: string;
    floor?: number | null;
    block_id: number;
    society_id: number;
    type?: FlatType | null;
    is_occupied: boolean;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface FlatCreationAttributes extends Optional<FlatAttributes, 'id' | 'uuid' | 'floor' | 'type' | 'is_occupied' | 'is_active'> {
}
export declare class Flat extends Model<FlatAttributes, FlatCreationAttributes> implements FlatAttributes {
    id: number;
    uuid: string;
    flat_number: string;
    floor: number | null;
    block_id: number;
    society_id: number;
    type: FlatType | null;
    is_occupied: boolean;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly block?: any;
    readonly society?: any;
    readonly residents?: any[];
    readonly visitors?: any[];
    static initModel(sequelize: Sequelize): typeof Flat;
}
export default Flat;
//# sourceMappingURL=Flat.d.ts.map
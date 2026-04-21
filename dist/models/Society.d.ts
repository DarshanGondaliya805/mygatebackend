import { Model, Sequelize, Optional } from 'sequelize';
export interface SocietyAttributes {
    id: number;
    uuid: string;
    name: string;
    location: string;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    total_blocks: number;
    logo?: string | null;
    is_active: boolean;
    created_by?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface SocietyCreationAttributes extends Optional<SocietyAttributes, 'id' | 'uuid' | 'city' | 'state' | 'pincode' | 'logo' | 'is_active' | 'created_by' | 'total_blocks'> {
}
export declare class Society extends Model<SocietyAttributes, SocietyCreationAttributes> implements SocietyAttributes {
    id: number;
    uuid: string;
    name: string;
    location: string;
    city: string | null;
    state: string | null;
    pincode: string | null;
    total_blocks: number;
    logo: string | null;
    is_active: boolean;
    created_by: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly blocks?: any[];
    readonly members?: any[];
    readonly policies?: any[];
    readonly amenities?: any[];
    static initModel(sequelize: Sequelize): typeof Society;
}
export default Society;
//# sourceMappingURL=Society.d.ts.map
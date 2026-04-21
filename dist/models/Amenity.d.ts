import { Model, Sequelize, Optional } from 'sequelize';
export type AmenityCategory = 'sports' | 'fitness' | 'leisure' | 'kids' | 'common' | 'other';
export interface AmenityAttributes {
    id: number;
    uuid: string;
    society_id: number;
    name: string;
    description?: string | null;
    icon?: string | null;
    image?: string | null;
    timing_open?: string | null;
    timing_close?: string | null;
    category: AmenityCategory;
    is_active: boolean;
    created_by: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface AmenityCreationAttributes extends Optional<AmenityAttributes, 'id' | 'uuid' | 'description' | 'icon' | 'image' | 'timing_open' | 'timing_close' | 'category' | 'is_active'> {
}
export declare class Amenity extends Model<AmenityAttributes, AmenityCreationAttributes> implements AmenityAttributes {
    id: number;
    uuid: string;
    society_id: number;
    name: string;
    description: string | null;
    icon: string | null;
    image: string | null;
    timing_open: string | null;
    timing_close: string | null;
    category: AmenityCategory;
    is_active: boolean;
    created_by: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static initModel(sequelize: Sequelize): typeof Amenity;
}
export default Amenity;
//# sourceMappingURL=Amenity.d.ts.map
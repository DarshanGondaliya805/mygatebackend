import { Model, Sequelize, Optional } from 'sequelize';
export type PolicyCategory = 'general' | 'parking' | 'pets' | 'noise' | 'maintenance' | 'security' | 'visitor' | 'other';
export interface SocietyPolicyAttributes {
    id: number;
    uuid: string;
    society_id: number;
    title: string;
    description: string;
    category: PolicyCategory;
    is_active: boolean;
    created_by: number;
    updated_by?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface SocietyPolicyCreationAttributes extends Optional<SocietyPolicyAttributes, 'id' | 'uuid' | 'category' | 'is_active' | 'updated_by'> {
}
export declare class SocietyPolicy extends Model<SocietyPolicyAttributes, SocietyPolicyCreationAttributes> implements SocietyPolicyAttributes {
    id: number;
    uuid: string;
    society_id: number;
    title: string;
    description: string;
    category: PolicyCategory;
    is_active: boolean;
    created_by: number;
    updated_by: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    static initModel(sequelize: Sequelize): typeof SocietyPolicy;
}
export default SocietyPolicy;
//# sourceMappingURL=SocietyPolicy.d.ts.map
import { Model, Sequelize, Optional } from 'sequelize';
export type VisitorType = 'guest' | 'delivery' | 'cab' | 'courier' | 'maintenance' | 'other';
export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked_out';
export interface VisitorAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image?: string | null;
    vehicle_number?: string | null;
    society_id: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface VisitorCreationAttributes extends Optional<VisitorAttributes, 'id' | 'uuid' | 'image' | 'vehicle_number'> {
}
export declare class Visitor extends Model<VisitorAttributes, VisitorCreationAttributes> implements VisitorAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image: string | null;
    vehicle_number: string | null;
    society_id: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly logs?: any[];
    readonly society?: any;
    static initModel(sequelize: Sequelize): typeof Visitor;
}
export default Visitor;
//# sourceMappingURL=Visitor.d.ts.map
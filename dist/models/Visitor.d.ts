import { Model, Sequelize, Optional } from 'sequelize';
export type VisitorType = 'guest' | 'delivery' | 'cab' | 'courier' | 'maintenance' | 'other';
export type VisitorStatus = 'pending' | 'approved' | 'rejected' | 'checked_out';
export interface VisitorAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image?: string | null;
    visitor_type: VisitorType;
    vehicle_number?: string | null;
    flat_id: number;
    society_id: number;
    host_user_id?: number | null;
    created_by?: number | null;
    status: VisitorStatus;
    purpose?: string | null;
    in_time?: Date | null;
    out_time?: Date | null;
    is_pre_approved: boolean;
    pre_approved_date?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface VisitorCreationAttributes extends Optional<VisitorAttributes, 'id' | 'uuid' | 'image' | 'vehicle_number' | 'host_user_id' | 'created_by' | 'status' | 'purpose' | 'in_time' | 'out_time' | 'is_pre_approved' | 'pre_approved_date'> {
}
export declare class Visitor extends Model<VisitorAttributes, VisitorCreationAttributes> implements VisitorAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    image: string | null;
    visitor_type: VisitorType;
    vehicle_number: string | null;
    flat_id: number;
    society_id: number;
    host_user_id: number | null;
    created_by: number | null;
    status: VisitorStatus;
    purpose: string | null;
    in_time: Date | null;
    out_time: Date | null;
    is_pre_approved: boolean;
    pre_approved_date: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly flat?: any;
    readonly society?: any;
    readonly host?: any;
    readonly createdByUser?: any;
    static initModel(sequelize: Sequelize): typeof Visitor;
}
export default Visitor;
//# sourceMappingURL=Visitor.d.ts.map
import { Model, Sequelize, Optional } from 'sequelize';
import { VisitorType, VisitorStatus } from './Visitor';
export interface VisitorLogAttributes {
    id: number;
    uuid: string;
    visitor_id: number;
    visitor_type: VisitorType;
    flat_id: number;
    society_id: number;
    host_user_id?: number | null;
    created_by?: number | null;
    created_by_staff?: number | null;
    status: VisitorStatus;
    purpose?: string | null;
    in_time: Date;
    out_time?: Date | null;
    is_pre_approved: boolean;
    pre_approved_date?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface VisitorLogCreationAttributes extends Optional<VisitorLogAttributes, 'id' | 'uuid' | 'host_user_id' | 'created_by' | 'created_by_staff' | 'status' | 'purpose' | 'out_time' | 'is_pre_approved' | 'pre_approved_date'> {
}
export declare class VisitorLog extends Model<VisitorLogAttributes, VisitorLogCreationAttributes> implements VisitorLogAttributes {
    id: number;
    uuid: string;
    visitor_id: number;
    visitor_type: VisitorType;
    flat_id: number;
    society_id: number;
    host_user_id: number | null;
    created_by: number | null;
    created_by_staff: number | null;
    status: VisitorStatus;
    purpose: string | null;
    in_time: Date;
    out_time: Date | null;
    is_pre_approved: boolean;
    pre_approved_date: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly visitor?: any;
    readonly flat?: any;
    readonly host?: any;
    readonly createdByStaff?: any;
    static initModel(sequelize: Sequelize): typeof VisitorLog;
}
export default VisitorLog;
//# sourceMappingURL=VisitorLog.d.ts.map
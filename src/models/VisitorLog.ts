import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
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

export interface VisitorLogCreationAttributes
  extends Optional<
    VisitorLogAttributes,
    | 'id'
    | 'uuid'
    | 'host_user_id'
    | 'created_by'
    | 'created_by_staff'
    | 'status'
    | 'purpose'
    | 'out_time'
    | 'is_pre_approved'
    | 'pre_approved_date'
  > {}

export class VisitorLog
  extends Model<VisitorLogAttributes, VisitorLogCreationAttributes>
  implements VisitorLogAttributes
{
  public id!: number;
  public uuid!: string;
  public visitor_id!: number;
  public visitor_type!: VisitorType;
  public flat_id!: number;
  public society_id!: number;
  public host_user_id!: number | null;
  public created_by!: number | null;
  public created_by_staff!: number | null;
  public status!: VisitorStatus;
  public purpose!: string | null;
  public in_time!: Date;
  public out_time!: Date | null;
  public is_pre_approved!: boolean;
  public pre_approved_date!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly visitor?: any;
  public readonly flat?: any;
  public readonly host?: any;
  public readonly createdByStaff?: any;

  static initModel(sequelize: Sequelize): typeof VisitorLog {
    VisitorLog.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        visitor_id: { type: DataTypes.INTEGER, allowNull: false },
        visitor_type: {
          type: DataTypes.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
          allowNull: false,
          defaultValue: 'guest',
        },
        flat_id: { type: DataTypes.INTEGER, allowNull: false },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        host_user_id: { type: DataTypes.INTEGER, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        created_by_staff: { type: DataTypes.INTEGER, allowNull: true },
        status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected', 'checked_out'),
          allowNull: false,
          defaultValue: 'pending',
        },
        purpose: { type: DataTypes.STRING(200), allowNull: true },
        in_time: { type: DataTypes.DATE, allowNull: false },
        out_time: { type: DataTypes.DATE, allowNull: true },
        is_pre_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
        pre_approved_date: { type: DataTypes.DATEONLY, allowNull: true },
      },
      {
        sequelize,
        tableName: 'visitor_logs',
        paranoid: true,
        timestamps: true,
      }
    );
    return VisitorLog;
  }
}

export default VisitorLog;

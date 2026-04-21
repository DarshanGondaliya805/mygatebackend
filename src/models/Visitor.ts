import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

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

export interface VisitorCreationAttributes
  extends Optional<VisitorAttributes, 'id' | 'uuid' | 'image' | 'vehicle_number' | 'host_user_id' | 'created_by' | 'status' | 'purpose' | 'in_time' | 'out_time' | 'is_pre_approved' | 'pre_approved_date'> {}

export class Visitor
  extends Model<VisitorAttributes, VisitorCreationAttributes>
  implements VisitorAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public phone!: string;
  public image!: string | null;
  public visitor_type!: VisitorType;
  public vehicle_number!: string | null;
  public flat_id!: number;
  public society_id!: number;
  public host_user_id!: number | null;
  public created_by!: number | null;
  public status!: VisitorStatus;
  public purpose!: string | null;
  public in_time!: Date | null;
  public out_time!: Date | null;
  public is_pre_approved!: boolean;
  public pre_approved_date!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly flat?: any;
  public readonly society?: any;
  public readonly host?: any;
  public readonly createdByUser?: any;

  static initModel(sequelize: Sequelize): typeof Visitor {
    Visitor.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(15), allowNull: false },
        image: { type: DataTypes.STRING(255), allowNull: true },
        visitor_type: {
          type: DataTypes.ENUM('guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'),
          allowNull: false,
          defaultValue: 'guest',
        },
        vehicle_number: { type: DataTypes.STRING(20), allowNull: true },
        flat_id: { type: DataTypes.INTEGER, allowNull: false },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        host_user_id: { type: DataTypes.INTEGER, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
        status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected', 'checked_out'),
          defaultValue: 'pending',
        },
        purpose: { type: DataTypes.STRING(200), allowNull: true },
        in_time: { type: DataTypes.DATE, allowNull: true },
        out_time: { type: DataTypes.DATE, allowNull: true },
        is_pre_approved: { type: DataTypes.BOOLEAN, defaultValue: false },
        pre_approved_date: { type: DataTypes.DATEONLY, allowNull: true },
      },
      { sequelize, tableName: 'visitors', paranoid: true, timestamps: true }
    );
    return Visitor;
  }
}

export default Visitor;

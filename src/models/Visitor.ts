import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

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

export interface VisitorCreationAttributes
  extends Optional<VisitorAttributes, 'id' | 'uuid' | 'image' | 'vehicle_number'> {}

export class Visitor
  extends Model<VisitorAttributes, VisitorCreationAttributes>
  implements VisitorAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public phone!: string;
  public image!: string | null;
  public vehicle_number!: string | null;
  public society_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly logs?: any[];
  public readonly society?: any;

  static initModel(sequelize: Sequelize): typeof Visitor {
    Visitor.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(15), allowNull: false },
        image: { type: DataTypes.STRING(255), allowNull: true },
        vehicle_number: { type: DataTypes.STRING(20), allowNull: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
      },
      { sequelize, tableName: 'visitors', paranoid: true, timestamps: true }
    );
    return Visitor;
  }
}

export default Visitor;

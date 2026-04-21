import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

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

export interface SocietyCreationAttributes
  extends Optional<SocietyAttributes, 'id' | 'uuid' | 'city' | 'state' | 'pincode' | 'logo' | 'is_active' | 'created_by' | 'total_blocks'> {}

export class Society
  extends Model<SocietyAttributes, SocietyCreationAttributes>
  implements SocietyAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public location!: string;
  public city!: string | null;
  public state!: string | null;
  public pincode!: string | null;
  public total_blocks!: number;
  public logo!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly blocks?: any[];
  public readonly members?: any[];
  public readonly policies?: any[];
  public readonly amenities?: any[];

  static initModel(sequelize: Sequelize): typeof Society {
    Society.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true, allowNull: false },
        name: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
        location: { type: DataTypes.TEXT, allowNull: false },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        pincode: { type: DataTypes.STRING(10), allowNull: true },
        total_blocks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        logo: { type: DataTypes.STRING(255), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        created_by: { type: DataTypes.INTEGER, allowNull: true },
      },
      {
        sequelize,
        tableName: 'societies',
        paranoid: true,
        timestamps: true,
      }
    );
    return Society;
  }
}

export default Society;

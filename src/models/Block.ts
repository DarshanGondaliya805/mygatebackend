import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface BlockAttributes {
  id: number;
  uuid: string;
  name: string;
  society_id: number;
  total_floors?: number | null;
  total_flats: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface BlockCreationAttributes
  extends Optional<BlockAttributes, 'id' | 'uuid' | 'total_floors' | 'total_flats' | 'is_active'> {}

export class Block
  extends Model<BlockAttributes, BlockCreationAttributes>
  implements BlockAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public society_id!: number;
  public total_floors!: number | null;
  public total_flats!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly flats?: any[];
  public readonly society?: any;

  static initModel(sequelize: Sequelize): typeof Block {
    Block.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true, allowNull: false },
        name: { type: DataTypes.STRING(50), allowNull: false, validate: { notEmpty: true } },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        total_floors: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
        total_flats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      {
        sequelize,
        tableName: 'blocks',
        paranoid: true,
        timestamps: true,
      }
    );
    return Block;
  }
}

export default Block;

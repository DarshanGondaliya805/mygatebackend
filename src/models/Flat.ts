import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export type FlatType = '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'studio' | 'penthouse' | 'other';

export interface FlatAttributes {
  id: number;
  uuid: string;
  flat_number: string;
  floor?: number | null;
  block_id: number;
  society_id: number;
  type?: FlatType | null;
  is_occupied: boolean;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface FlatCreationAttributes
  extends Optional<FlatAttributes, 'id' | 'uuid' | 'floor' | 'type' | 'is_occupied' | 'is_active'> {}

export class Flat
  extends Model<FlatAttributes, FlatCreationAttributes>
  implements FlatAttributes
{
  public id!: number;
  public uuid!: string;
  public flat_number!: string;
  public floor!: number | null;
  public block_id!: number;
  public society_id!: number;
  public type!: FlatType | null;
  public is_occupied!: boolean;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly block?: any;
  public readonly society?: any;
  public readonly residents?: any[];
  public readonly visitors?: any[];

  static initModel(sequelize: Sequelize): typeof Flat {
    Flat.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true, allowNull: false },
        flat_number: { type: DataTypes.STRING(20), allowNull: false, validate: { notEmpty: true } },
        floor: { type: DataTypes.INTEGER, allowNull: true },
        block_id: { type: DataTypes.INTEGER, allowNull: false },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        type: {
          type: DataTypes.ENUM('1BHK', '2BHK', '3BHK', '4BHK', 'studio', 'penthouse', 'other'),
          allowNull: true,
        },
        is_occupied: { type: DataTypes.BOOLEAN, defaultValue: false },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      {
        sequelize,
        tableName: 'flats',
        paranoid: true,
        timestamps: true,
      }
    );
    return Flat;
  }
}

export default Flat;

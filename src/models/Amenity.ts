import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export type AmenityCategory = 'sports' | 'fitness' | 'leisure' | 'kids' | 'common' | 'other';

export interface AmenityAttributes {
  id: number;
  uuid: string;
  society_id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  timing_open?: string | null;
  timing_close?: string | null;
  category: AmenityCategory;
  is_active: boolean;
  created_by: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface AmenityCreationAttributes
  extends Optional<AmenityAttributes, 'id' | 'uuid' | 'description' | 'icon' | 'image' | 'timing_open' | 'timing_close' | 'category' | 'is_active'> {}

export class Amenity
  extends Model<AmenityAttributes, AmenityCreationAttributes>
  implements AmenityAttributes
{
  public id!: number;
  public uuid!: string;
  public society_id!: number;
  public name!: string;
  public description!: string | null;
  public icon!: string | null;
  public image!: string | null;
  public timing_open!: string | null;
  public timing_close!: string | null;
  public category!: AmenityCategory;
  public is_active!: boolean;
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof Amenity {
    Amenity.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.STRING(100), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        icon: { type: DataTypes.STRING(255), allowNull: true },
        image: { type: DataTypes.STRING(255), allowNull: true },
        timing_open: { type: DataTypes.TIME, allowNull: true },
        timing_close: { type: DataTypes.TIME, allowNull: true },
        category: {
          type: DataTypes.ENUM('sports', 'fitness', 'leisure', 'kids', 'common', 'other'),
          defaultValue: 'common',
        },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
      },
      { sequelize, tableName: 'amenities', paranoid: true, timestamps: true }
    );
    return Amenity;
  }
}

export default Amenity;

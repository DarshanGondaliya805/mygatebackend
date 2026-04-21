import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export type PolicyCategory = 'general' | 'parking' | 'pets' | 'noise' | 'maintenance' | 'security' | 'visitor' | 'other';

export interface SocietyPolicyAttributes {
  id: number;
  uuid: string;
  society_id: number;
  title: string;
  description: string;
  category: PolicyCategory;
  is_active: boolean;
  created_by: number;
  updated_by?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SocietyPolicyCreationAttributes
  extends Optional<SocietyPolicyAttributes, 'id' | 'uuid' | 'category' | 'is_active' | 'updated_by'> {}

export class SocietyPolicy
  extends Model<SocietyPolicyAttributes, SocietyPolicyCreationAttributes>
  implements SocietyPolicyAttributes
{
  public id!: number;
  public uuid!: string;
  public society_id!: number;
  public title!: string;
  public description!: string;
  public category!: PolicyCategory;
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  static initModel(sequelize: Sequelize): typeof SocietyPolicy {
    SocietyPolicy.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING(200), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        category: {
          type: DataTypes.ENUM('general', 'parking', 'pets', 'noise', 'maintenance', 'security', 'visitor', 'other'),
          defaultValue: 'general',
        },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
        updated_by: { type: DataTypes.INTEGER, allowNull: true },
      },
      { sequelize, tableName: 'society_policies', paranoid: true, timestamps: true }
    );
    return SocietyPolicy;
  }
}

export default SocietyPolicy;

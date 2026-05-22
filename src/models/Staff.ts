import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

export type StaffType = 'security' | 'cleaning' | 'gardening' | 'maintenance' | 'electrician' | 'plumber' | 'lift_operator' | 'other';
export type SalaryType = 'monthly' | 'daily' | 'hourly';

export interface StaffAttributes {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  email?: string | null;
  image?: string | null;
  dob?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  staff_type: StaffType;
  salary?: number | null;
  salary_type: SalaryType;
  address?: string | null;
  documents?: string[] | null;
  password?: string | null;
  fcm_token?: string | null;
  society_id: number;
  is_active: boolean;
  joining_date?: string | null;
  created_by: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface StaffCreationAttributes
  extends Optional<StaffAttributes, 'id' | 'uuid' | 'email' | 'image' | 'dob' | 'gender' | 'salary' | 'salary_type' | 'address' | 'documents' | 'password' | 'fcm_token' | 'is_active' | 'joining_date'> {}

export class Staff
  extends Model<StaffAttributes, StaffCreationAttributes>
  implements StaffAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public phone!: string;
  public email!: string | null;
  public image!: string | null;
  public dob!: string | null;
  public gender!: 'male' | 'female' | 'other' | null;
  public staff_type!: StaffType;
  public salary!: number | null;
  public salary_type!: SalaryType;
  public address!: string | null;
  public documents!: string[] | null;
  public password!: string | null;
  public fcm_token!: string | null;
  public society_id!: number;
  public is_active!: boolean;
  public joining_date!: string | null;
  public created_by!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly society?: any;

  static initModel(sequelize: Sequelize): typeof Staff {
    Staff.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(15), allowNull: false },
        email: { type: DataTypes.STRING(150), allowNull: true },
        image: { type: DataTypes.STRING(255), allowNull: true },
        dob: { type: DataTypes.DATEONLY, allowNull: true },
        gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
        staff_type: {
          type: DataTypes.ENUM('security', 'cleaning', 'gardening', 'maintenance', 'electrician', 'plumber', 'lift_operator', 'other'),
          allowNull: false,
        },
        salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        salary_type: {
          type: DataTypes.ENUM('monthly', 'daily', 'hourly'),
          defaultValue: 'monthly',
        },
        address: { type: DataTypes.TEXT, allowNull: true },
        documents: { type: DataTypes.JSON, allowNull: true },
        password: { type: DataTypes.STRING(255), allowNull: true },
        fcm_token: { type: DataTypes.STRING(255), allowNull: true },
        society_id: { type: DataTypes.INTEGER, allowNull: false },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        joining_date: { type: DataTypes.DATEONLY, allowNull: true },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize, tableName: 'staff', paranoid: true, timestamps: true,
        defaultScope: { attributes: { exclude: ['password'] } },
        hooks: {
          beforeSave: async (staff) => {
            if (staff.changed('password') && staff.password) {
              staff.password = await bcrypt.hash(staff.password, 12);
            }
          },
        },
      }
    );
    return Staff;
  }
}

export default Staff;

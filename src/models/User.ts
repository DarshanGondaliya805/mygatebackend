import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
  Association,
} from 'sequelize';

export type UserRole = 'super_admin' | 'admin' | 'user' | 'security';
export type UserType = 'owner' | 'rented';
export type Gender = 'male' | 'female' | 'other';

export interface UserAttributes {
  id: number;
  uuid: string;
  name: string;
  email?: string | null;
  phone: string;
  password: string;
  image?: string | null;
  gender?: Gender | null;
  dob?: string | null;
  role: UserRole;
  user_type?: UserType | null;
  flat_id?: number | null;
  society_id?: number | null;
  is_approved: boolean;
  is_active: boolean;
  fcm_token?: string | null;
  refresh_token?: string | null;
  last_login?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'uuid'
    | 'email'
    | 'image'
    | 'gender'
    | 'dob'
    | 'user_type'
    | 'flat_id'
    | 'society_id'
    | 'is_approved'
    | 'is_active'
    | 'fcm_token'
    | 'refresh_token'
    | 'last_login'
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public uuid!: string;
  public name!: string;
  public email!: string | null;
  public phone!: string;
  public password!: string;
  public image!: string | null;
  public gender!: Gender | null;
  public dob!: string | null;
  public role!: UserRole;
  public user_type!: UserType | null;
  public flat_id!: number | null;
  public society_id!: number | null;
  public is_approved!: boolean;
  public is_active!: boolean;
  public fcm_token!: string | null;
  public refresh_token!: string | null;
  public last_login!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations (populated by Sequelize)
  public readonly society?: any;
  public readonly flat?: any;
  public readonly complaints?: any[];
  public readonly notifications?: any[];

  public static associations: {
    society: Association;
    flat: Association;
  };

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          unique: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: { notEmpty: true, len: [2, 100] },
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: true,
          unique: true,
          validate: { isEmail: true },
        },
        phone: {
          type: DataTypes.STRING(15),
          allowNull: false,
          unique: true,
          validate: { notEmpty: true },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM('male', 'female', 'other'),
          allowNull: true,
        },
        dob: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM('super_admin', 'admin', 'user', 'security'),
          allowNull: false,
          defaultValue: 'user',
        },
        user_type: {
          type: DataTypes.ENUM('owner', 'rented'),
          allowNull: true,
        },
        flat_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        society_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        is_approved: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        fcm_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        paranoid: true,
        timestamps: true,
        defaultScope: {
          attributes: { exclude: ['password', 'refresh_token'] },
        },
        scopes: {
          active: { where: { is_active: true, is_approved: true } },
        },
      }
    );
    return User;
  }
}

export default User;

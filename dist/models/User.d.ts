import { Model, Sequelize, Optional, Association } from 'sequelize';
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
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'uuid' | 'email' | 'image' | 'gender' | 'dob' | 'user_type' | 'flat_id' | 'society_id' | 'is_approved' | 'is_active' | 'fcm_token' | 'refresh_token' | 'last_login'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    uuid: string;
    name: string;
    email: string | null;
    phone: string;
    password: string;
    image: string | null;
    gender: Gender | null;
    dob: string | null;
    role: UserRole;
    user_type: UserType | null;
    flat_id: number | null;
    society_id: number | null;
    is_approved: boolean;
    is_active: boolean;
    fcm_token: string | null;
    refresh_token: string | null;
    last_login: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly society?: any;
    readonly flat?: any;
    readonly complaints?: any[];
    readonly notifications?: any[];
    static associations: {
        society: Association;
        flat: Association;
    };
    static initModel(sequelize: Sequelize): typeof User;
}
export default User;
//# sourceMappingURL=User.d.ts.map
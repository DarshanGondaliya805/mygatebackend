import { Model, Sequelize, Optional } from 'sequelize';
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
    society_id: number;
    is_active: boolean;
    joining_date?: string | null;
    created_by: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}
export interface StaffCreationAttributes extends Optional<StaffAttributes, 'id' | 'uuid' | 'email' | 'image' | 'dob' | 'gender' | 'salary' | 'salary_type' | 'address' | 'documents' | 'password' | 'is_active' | 'joining_date'> {
}
export declare class Staff extends Model<StaffAttributes, StaffCreationAttributes> implements StaffAttributes {
    id: number;
    uuid: string;
    name: string;
    phone: string;
    email: string | null;
    image: string | null;
    dob: string | null;
    gender: 'male' | 'female' | 'other' | null;
    staff_type: StaffType;
    salary: number | null;
    salary_type: SalaryType;
    address: string | null;
    documents: string[] | null;
    password: string | null;
    society_id: number;
    is_active: boolean;
    joining_date: string | null;
    created_by: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
    readonly society?: any;
    static initModel(sequelize: Sequelize): typeof Staff;
}
export default Staff;
//# sourceMappingURL=Staff.d.ts.map
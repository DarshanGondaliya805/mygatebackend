export declare class AuthService {
    login(identifier: string, password: string, fcmToken?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            uuid: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            source: string;
            society_id: any;
            staff_type?: undefined;
        };
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            uuid: any;
            name: any;
            email: any;
            phone: any;
            role: string;
            staff_type: any;
            source: string;
            society_id: any;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number, source?: string): Promise<void>;
    changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map
export declare const config: {
    env: string;
    port: number;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    upload: {
        path: string;
        maxSize: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    superAdmin: {
        name: string;
        email: string;
        phone: string;
        password: string;
    };
};
export default config;
//# sourceMappingURL=app.d.ts.map
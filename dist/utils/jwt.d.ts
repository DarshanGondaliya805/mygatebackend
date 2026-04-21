export interface TokenPayload {
    id: number;
    uuid: string;
    role: string;
    society_id?: number | null;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
//# sourceMappingURL=jwt.d.ts.map
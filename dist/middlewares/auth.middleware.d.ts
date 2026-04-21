import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: TokenPayload & {
        dbUser?: any;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireSameSociety: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare class AuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    me(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map
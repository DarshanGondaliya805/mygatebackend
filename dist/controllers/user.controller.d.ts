import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare class UserController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    register(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUnapproved(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    toggleActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getBuildingDirectory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=user.controller.d.ts.map
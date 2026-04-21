import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare class VisitorController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByPhone(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    preApprove(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: VisitorController;
export default _default;
//# sourceMappingURL=visitor.controller.d.ts.map
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare class ComplaintController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ComplaintController;
export default _default;
//# sourceMappingURL=complaint.controller.d.ts.map
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare class StaffController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class DailyHelperController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyHelpers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllForSociety(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    logEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    logExit(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class EventController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class ServiceContactController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class PolicyController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare class AmenityController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const staffController: StaffController;
export declare const dailyHelperController: DailyHelperController;
export declare const eventController: EventController;
export declare const serviceContactController: ServiceContactController;
export declare const policyController: PolicyController;
export declare const amenityController: AmenityController;
//# sourceMappingURL=misc.controller.d.ts.map
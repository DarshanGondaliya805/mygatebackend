import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import authService from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password, fcm_token } = req.body;
      const result = await authService.login(identifier, password, fcm_token);
      sendSuccess(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;
      const result = await authService.refreshToken(refresh_token);
      sendSuccess(res, 'Token refreshed', result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!.id, req.user!.source);
      sendSuccess(res, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { old_password, new_password } = req.body;
      await authService.changePassword(req.user!.id, old_password, new_password);
      sendSuccess(res, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, 'Profile fetched', req.user?.dbUser);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();

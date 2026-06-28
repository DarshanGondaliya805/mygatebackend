import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import authService from '../services/auth.service';
import { User, Staff, Flat, Block, Society } from '../models';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import logger from '../utils/logger';

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

  async updateFcmToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fcm_token } = req.body;
      console.log('fcm token----------------------------------', fcm_token);
      if (typeof fcm_token !== 'string' || fcm_token.trim() === '') {
        sendError(res, 'fcm_token is required', 400);
        return;
      }

      if (req.user!.source === 'staff') {
        await Staff.update({ fcm_token }, { where: { id: req.user!.id } });
      } else {
        await User.update({ fcm_token }, { where: { id: req.user!.id } });
      }

      sendSuccess(res, 'FCM token updated successfully');
    } catch (err) {
      logger.error(`[updateFcmToken] Failed for ${req.user?.source} id=${req.user?.id}: ${err}`);
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // ── Security staff — return plain staff profile (no flat/block) ───────
      if (req.user!.source === 'staff') {
        const staff = await Staff.findByPk(req.user!.id, {
          attributes: { exclude: ['password', 'fcm_token'] },
          include: [
            { model: Society, as: 'society', attributes: ['id', 'name', 'location', 'city', 'state', 'logo'] },
          ],
        });
        if (!staff) { sendNotFound(res, 'Staff not found'); return; }
        sendSuccess(res, 'Profile fetched', staff);
        return;
      }

      // ── Resident / Admin — include flat → block → society ─────────────────
      const user = await User.findByPk(req.user!.id, {
        attributes: { exclude: ['password', 'refresh_token', 'fcm_token'] },
        include: [
          {
            model: Flat,
            as: 'flat',
            attributes: ['id', 'flat_number', 'floor', 'type', 'is_occupied'],
            include: [
              {
                model: Block,
                as: 'block',
                attributes: ['id', 'name', 'total_floors'],
              },
            ],
          },
          {
            model: Society,
            as: 'society',
            attributes: ['id', 'name', 'location', 'city', 'state', 'pincode', 'logo', 'total_blocks'],
          },
        ],
      });

      if (!user) { sendNotFound(res, 'User not found'); return; }
      sendSuccess(res, 'Profile fetched', user);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: TokenPayload & { dbUser?: any };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findOne({
      where: { id: payload.id, is_active: true, is_approved: true },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found or inactive');
      return;
    }

    req.user = { ...payload, dbUser: user };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendUnauthorized(res, 'Token expired');
    } else {
      sendUnauthorized(res, 'Invalid token');
    }
  }
};

// Role-based access control
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'You do not have permission to perform this action');
      return;
    }
    next();
  };
};

// Society-level access - user must belong to the same society
export const requireSameSociety = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const societyId =
    parseInt(req.params.societyId || req.body.society_id) ||
    req.user?.society_id;

  if (
    req.user?.role !== 'super_admin' &&
    req.user?.society_id !== societyId
  ) {
    sendForbidden(res, 'Access denied to this society');
    return;
  }
  next();
};

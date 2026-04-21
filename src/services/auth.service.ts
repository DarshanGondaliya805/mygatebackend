import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';

export class AuthService {
  async login(identifier: string, password: string) {
    const identify = String(identifier).trim();
    const user = await User.unscoped().findOne({
      where: {
        is_active: true,
        ...(identify.includes('@') ? { email: identify } : { phone: identify }),
      },
    });

    if (!user) throw new AppError('Invalid credentials', 401);
    if (!user.is_approved) throw new AppError('Your account is pending approval', 403);

    const isMatch = await bcrypt.compare(password, (user as any).dataValues.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const payload = {
      id: user.id,
      uuid: user.uuid,
      role: user.role,
      society_id: user.society_id,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store hashed refresh token
    await user.update({ refresh_token: refreshToken, last_login: new Date() });

    const { id, uuid, name, email, phone, role } = (user as any).dataValues;

    return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role } };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    const user = await User.findOne({
      where: { id: payload.id, is_active: true },
    });

    if (!user) throw new AppError('User not found', 401);

    const newPayload = {
      id: user.id,
      uuid: user.uuid,
      role: user.role,
      society_id: user.society_id,
    };

    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    await user.update({ refresh_token: refreshToken });

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    await User.update({ refresh_token: null }, { where: { id: userId } });
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.unscoped().findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(oldPassword, (user as any).dataValues.password);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashed });
  }
}

export default new AuthService();

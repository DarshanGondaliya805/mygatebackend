import bcrypt from 'bcryptjs';
import { User, Staff } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';

export class AuthService {
  async login(identifier: string, password: string, fcmToken?: string) {
    const identify = String(identifier).trim();
    const byEmail = identify.includes('@');

    // ── 1. Try users table first ──────────────────────────────────────────────
    const user = await User.unscoped().findOne({
      where: {
        is_active: true,
        ...(byEmail ? { email: identify } : { phone: identify }),
      },
      attributes: ['id', 'uuid', 'name', 'email', 'phone', 'password', 'role', 'society_id', 'is_approved', 'is_active', 'fcm_token', 'last_login'],
    });

    if (user) {
      if (!user.is_approved) throw new AppError('Your account is pending approval', 403);

      const storedHash = user.getDataValue('password');
      const isMatch = storedHash ? await bcrypt.compare(password, storedHash) : false;
      if (!isMatch) throw new AppError('Invalid credentials', 401);

      const payload = { id: user.id, uuid: user.uuid, role: user.role, society_id: user.society_id, source: 'user' as const };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await user.update({
        refresh_token: refreshToken,
        last_login: new Date(),
        ...(fcmToken ? { fcm_token: fcmToken } : {}),
      });

      const { id, uuid, name, email, phone, role,society_id  } = (user as any).dataValues;
      return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role, source: 'user',society_id : society_id } };
    }

    // ── 2. Fall back to staff table ───────────────────────────────────────────
    const staff = await Staff.unscoped().findOne({
      where: {
        is_active: true,
        ...(byEmail ? { email: identify } : { phone: identify }),
      },
      attributes: ['id', 'uuid', 'name', 'email', 'phone', 'password', 'staff_type', 'society_id', 'is_active'],
    });
    if (!staff) throw new AppError('Invalid credentials', 401);

    const staffHash = staff.getDataValue('password');
    if (!staffHash) throw new AppError('Password not set for this staff account', 400);

    const staffMatch = await bcrypt.compare(password, staffHash);
    if (!staffMatch) throw new AppError('Invalid credentials', 401);

    const staffPayload = { id: staff.id, uuid: staff.uuid, role: 'security' as const, society_id: staff.society_id, source: 'staff' as const };
    const accessToken = generateAccessToken(staffPayload);
    const refreshToken = generateRefreshToken(staffPayload);

    const { id, uuid, name, email, phone, staff_type,society_id } = (staff as any).dataValues;
    return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role: 'security', staff_type, source: 'staff', society_id: society_id } };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    if (payload.source === 'staff') {
      const staff = await Staff.unscoped().findOne({
        where: { id: payload.id, is_active: true },
        attributes: ['id', 'uuid', 'staff_type', 'society_id', 'is_active'],
      });
      if (!staff) throw new AppError('Staff not found', 401);

      const newPayload = { id: staff.id, uuid: staff.uuid, role: 'security' as const, society_id: staff.society_id, source: 'staff' as const };
      return {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
      };
    }

    const user = await User.unscoped().findOne({
      where: { id: payload.id, is_active: true },
      attributes: ['id', 'uuid', 'role', 'society_id', 'is_approved', 'is_active'],
    });
    if (!user) throw new AppError('User not found', 401);

    const newPayload = { id: user.id, uuid: user.uuid, role: user.role, society_id: user.society_id, source: 'user' as const };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);
    await user.update({ refresh_token: refreshToken });
    return { accessToken, refreshToken };
  }

  async logout(userId: number, source?: string) {
    if (source === 'staff') return; // staff table has no refresh_token column
    await User.update({ refresh_token: null, fcm_token: null }, { where: { id: userId } });
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.unscoped().findByPk(userId, {
      attributes: ['id', 'password'],
    });
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(oldPassword, user.getDataValue('password'));
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashed });
  }
}

export default new AuthService();

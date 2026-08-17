import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import {
  sequelize, User, Staff, Notification, Complaint, Event,
  DailyHelper, HelperEntryLog, VisitorLog, SocietyPolicy, Amenity, ServiceContact,
} from '../models';
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

      const loginAt = new Date();
      await user.update({
        refresh_token: refreshToken,
        last_login: loginAt,
        ...(fcmToken ? { fcm_token: fcmToken } : {}),
      });

      const { id, uuid, name, email, phone, role, society_id } = (user as any).dataValues;
      return { accessToken, refreshToken, user: { id, uuid, name: name ?? '', email: email ?? '', phone: phone ?? '', role, source: 'user', society_id, last_login: loginAt } };
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

    if (fcmToken) {
      await staff.update({ fcm_token: fcmToken });
    } else {
      // App did not send fcm_token — token stays null, push notifications will not reach this staff
      console.warn(`[Auth] Staff id=${staff.id} logged in WITHOUT fcm_token — notifications will fail`);
    }

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
    if (source === 'staff') {
      await Staff.update({ fcm_token: null }, { where: { id: userId } });
      return;
    }
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

  // Self-service account deletion (Apple Guideline 5.1.1(v)) — permanent hard delete,
  // not a deactivation. Cascades all personal data owned by the user; visitor logs
  // are anonymized (host detached) rather than deleted, to preserve other residents' history.
  async deleteAccount(userId: number, source?: string) {
    if (source === 'staff') {
      throw new AppError('Staff accounts must be removed by your society admin', 400);
    }

    const user = await User.unscoped().findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    // staff/society_policies/amenities/service_contacts all have a NOT NULL
    // created_by FK with ON DELETE CASCADE to users — hard-deleting this user
    // would silently wipe out that society-wide content if left untouched.
    // Reassign ownership to another admin instead of destroying it or blocking deletion.
    const [staffCount, policyCount, amenityCount, contactCount] = await Promise.all([
      Staff.count({ where: { created_by: userId } }),
      SocietyPolicy.count({ where: { created_by: userId } }),
      Amenity.count({ where: { created_by: userId } }),
      ServiceContact.count({ where: { created_by: userId } }),
    ]);
    const ownsSocietyContent = staffCount + policyCount + amenityCount > 0 || contactCount > 0;

    // Reassign to another admin when one exists. If nobody else is left to
    // administer this society (e.g. the sole super_admin deleting themselves),
    // these records have no rightful owner anymore — remove them along with
    // the account instead of blocking deletion indefinitely.
    let reassignToId: number | null = null;
    let cascadeOwnedContent = false;
    if (ownsSocietyContent) {
      const fallbackAdmin =
        (await User.findOne({
          where: {
            id: { [Op.ne]: userId },
            society_id: user.society_id,
            role: { [Op.in]: ['admin', 'super_admin'] },
            is_active: true,
          },
        })) ||
        (await User.findOne({
          where: { id: { [Op.ne]: userId }, role: 'super_admin', is_active: true },
        }));

      if (fallbackAdmin) {
        reassignToId = fallbackAdmin.id;
      } else {
        cascadeOwnedContent = true;
      }
    }

    const imagePath = user.getDataValue('image');

    const t = await sequelize.transaction();
    try {
      if (reassignToId) {
        await Staff.update({ created_by: reassignToId }, { where: { created_by: userId }, transaction: t });
        await SocietyPolicy.update({ created_by: reassignToId }, { where: { created_by: userId }, transaction: t });
        await SocietyPolicy.update({ updated_by: reassignToId }, { where: { updated_by: userId }, transaction: t });
        await Amenity.update({ created_by: reassignToId }, { where: { created_by: userId }, transaction: t });
        await ServiceContact.update({ created_by: reassignToId }, { where: { created_by: userId }, transaction: t });
      } else if (cascadeOwnedContent) {
        // Staff FK is referenced by helper_entry_logs.created_by_staff and
        // visitor_logs/visitors.created_by_staff, both ON DELETE SET NULL — safe to hard-delete.
        await Staff.destroy({ where: { created_by: userId }, force: true, transaction: t });
        await SocietyPolicy.destroy({ where: { created_by: userId }, force: true, transaction: t });
        await SocietyPolicy.update({ updated_by: null }, { where: { updated_by: userId }, transaction: t });
        await Amenity.destroy({ where: { created_by: userId }, force: true, transaction: t });
        await ServiceContact.destroy({ where: { created_by: userId }, force: true, transaction: t });
      }

      await Notification.destroy({ where: { user_id: userId }, force: true, transaction: t });

      await Complaint.destroy({ where: { raised_by: userId }, force: true, transaction: t });
      await Complaint.update({ assigned_to: null }, { where: { assigned_to: userId }, transaction: t });

      await Event.destroy({ where: { created_by: userId }, force: true, transaction: t });

      const helpers = await DailyHelper.findAll({ where: { user_id: userId }, attributes: ['id'], transaction: t });
      const helperIds = helpers.map((h) => h.id);
      if (helperIds.length > 0) {
        await HelperEntryLog.destroy({ where: { daily_helper_id: helperIds }, force: true, transaction: t });
      }
      await DailyHelper.destroy({ where: { user_id: userId }, force: true, transaction: t });

      // Preserve visitor-log history for other residents — just detach this user
      await VisitorLog.update({ host_user_id: null }, { where: { host_user_id: userId }, transaction: t });
      await VisitorLog.update({ created_by: null }, { where: { created_by: userId }, transaction: t });

      await user.destroy({ force: true, transaction: t }); // hard delete — also revokes refresh_token/fcm_token with the row

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw new AppError('Unable to delete account — some related data could not be removed. Please try again or contact support.', 500);
    }

    if (imagePath) {
      fs.unlink(path.join(process.cwd(), imagePath), () => {}); // best-effort; row is already gone either way
    }
  }
}

export default new AuthService();

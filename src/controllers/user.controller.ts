import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User, Flat, Society } from '../models';
import { sendSuccess, sendCreated, sendNotFound, sendError, getPagination, getPaginationMeta } from '../utils/response';
import { getRelativePath } from '../utils/upload';
import notificationService from '../services/notification.service';

export class UserController {
  // Super Admin / Admin: create user
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name, email, phone, password, gender, dob,
        role, user_type, flat_id, society_id,
      } = req.body;

      const image = req.file ? getRelativePath(req.file.path) : null;

      // Admin can only create users within their own society
      const targetSocietyId =
        req.user!.role === 'super_admin' ? society_id : req.user!.society_id;

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);  // password validated in route

      // Super admin / admin created users are auto-approved
      const user = await User.create({
        name, email, phone,
        password: hashedPassword,
        image, gender, dob,
        role: role || 'user',
        user_type,
        flat_id: flat_id || null,
        society_id: targetSocietyId,
        is_approved: true,
        is_active: true,
      });

      // Mark flat as occupied if assigned
      if (flat_id) {
        await Flat.update({ is_occupied: true }, { where: { id: flat_id } });
      }

      const { password: _, ...userWithoutPassword } = (user as any).dataValues;
      sendCreated(res, 'User created successfully', userWithoutPassword);
    } catch (err) {
      next(err);
    }
  }

  // Self-registration — goes for approval
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password, gender, dob, user_type, flat_id, society_id } = req.body;
      const image = req.file ? getRelativePath(req.file.path) : null;

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name, email, phone,
        password: hashedPassword,
        image, gender, dob,
        role: 'user',
        user_type,
        flat_id: flat_id || null,
        society_id,
        is_approved: false, // pending admin approval
        is_active: true,
      });

      // Notify society admins
      const admins = await User.findAll({
        where: { society_id, role: ['admin', 'super_admin'], is_active: true },
        attributes: ['id'],
      });

      await notificationService.sendToMany(
        admins.map((a) => a.id),
        {
          title: 'New User Registration',
          body: `${name} has registered and is waiting for approval.`,
          type: 'approval_request',
          reference_id: user.id,
          reference_type: 'user',
        }
      );

      sendCreated(res, 'Registration successful. Waiting for admin approval.');
    } catch (err) {
      next(err);
    }
  }

  async getUnapproved(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Support both GET (query) and POST (body)
      const source = req.method === 'POST' ? req.body : req.query;

      const page   = parseInt(source.page)  || 1;
      const limit  = parseInt(source.limit) || 20;
      const search = source.search as string | undefined;
      const sortBy = (source.sort_by as string) || 'createdAt';
      const sortOrder = (source.sort_order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const allowedSorts = ['name', 'email', 'phone', 'createdAt'];
      const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';

      const where: any = { is_approved: false, is_active: true };

      if (req.user!.role !== 'super_admin') {
        where.society_id = req.user!.society_id;
      } else if (source.society_id) {
        where.society_id = source.society_id;
      }

      if (search) {
        where[Op.or] = [
          { name:  { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        include: [
          { model: Flat, as: 'flat' },
          { model: Society, as: 'society', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [[orderField, sortOrder]],
      });

      sendSuccess(res, 'Unapproved users fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) { sendNotFound(res, 'User not found'); return; }

      await user.update({ is_approved: true });

      await notificationService.send({
        user_id: user.id,
        title: 'Account Approved',
        body: 'Your account has been approved. You can now log in.',
        type: 'approval_request',
      });

      sendSuccess(res, 'User approved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { role, is_approved, search } = req.query;

      const where: any = {};

      // Admins only see their society's users
      if (req.user!.role !== 'super_admin') {
        where.society_id = req.user!.society_id;
      } else if (req.query.society_id) {
        where.society_id = req.query.society_id;
      }

      if (role) where.role = role;
      if (is_approved !== undefined) where.is_approved = is_approved === 'true';
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        include: [
          { model: Flat, as: 'flat' },
          { model: Society, as: 'society', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [['createdAt', 'DESC']],
      });

      sendSuccess(res, 'Users fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          { model: Flat, as: 'flat' },
          { model: Society, as: 'society', attributes: ['id', 'name'] },
        ],
      });
      if (!user) { sendNotFound(res, 'User not found'); return; }
      sendSuccess(res, 'User fetched', user);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) { sendNotFound(res, 'User not found'); return; }

      const { name, email, phone, password, gender, dob, user_type, flat_id, society_id, is_active, fcm_token } = req.body;
      const image = req.file ? getRelativePath(req.file.path) : undefined;

      // Hash the new password (password is required — validated in route)
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Super admin can move a user to a different society; others keep current
      const targetSocietyId =
        req.user!.role === 'super_admin' && society_id ? society_id : user.society_id;

      await user.update({
        name, email, phone, gender, dob, user_type,
        password: hashedPassword,
        society_id: targetSocietyId,
        flat_id: flat_id !== undefined ? flat_id : user.flat_id,
        ...(is_active !== undefined ? { is_active } : {}),
        ...(fcm_token ? { fcm_token } : {}),
        ...(image ? { image } : {}),
      });

      sendSuccess(res, 'User updated', user);
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) { sendNotFound(res, 'User not found'); return; }

      if (!['admin', 'super_admin'].includes(user.role)) {
        sendError(res, 'Only admin accounts can be toggled here', 400);
        return;
      }

      await user.update({ is_active: !user.is_active });
      sendSuccess(res, `Admin ${user.is_active ? 'activated' : 'deactivated'} successfully`, { id: user.id, is_active: user.is_active });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.unscoped().findByPk(req.params.id);
      if (!user) { sendNotFound(res, 'User not found'); return; }

      // Free up unique-constrained fields before soft-delete so the same
      // email / phone can be re-registered immediately after deletion.
      const ts = Date.now();
      await user.update({
        phone: `deleted_${user.id}_${ts}`,
        email: user.email ? `deleted_${user.id}_${ts}@deleted.invalid` : null,
      });

      await user.destroy();
      sendSuccess(res, 'User deleted');
    } catch (err) {
      next(err);
    }
  }

  // Get flat-mates / building directory
  async getBuildingDirectory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const societyId = req.user!.society_id;
      const users = await User.findAll({
        where: {
          society_id: societyId,
          role: 'user',
          is_approved: true,
          is_active: true,
        },
        include: [{ model: Flat, as: 'flat', attributes: ['id', 'flat_number', 'floor'] }],
        attributes: ['id', 'name', 'phone', 'image', 'flat_id'],
        order: [['name', 'ASC']],
      });
      sendSuccess(res, 'Building directory fetched', users);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();

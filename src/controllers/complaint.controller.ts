import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Complaint, User } from '../models';
import { sendSuccess, sendCreated, sendNotFound, sendError, getPagination, getPaginationMeta } from '../utils/response';
import { getRelativePath } from '../utils/upload';
import notificationService from '../services/notification.service';

const queryId = (req: AuthRequest): number | undefined => req.user!.role === 'super_admin' ? (req.query.society_id as any) : req.user!.society_id!;

export class ComplaintController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, category, priority } = req.body;
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((f) => getRelativePath(f.path))
        : null;

      const societyId = req.user!.society_id!;

      const complaint = await Complaint.create({
        title, description, category,
        priority: priority || 'medium',
        images,
        raised_by: req.user!.id,
        flat_id: req.user!.dbUser?.flat_id || null,
        society_id: societyId,
      });

      // Notify society admins
      const admins = await User.findAll({
        where: { society_id: societyId, role: ['admin', 'super_admin'], is_active: true },
        attributes: ['id'],
      });

      await notificationService.sendToMany(admins.map((a) => a.id), {
        title: 'New Complaint',
        body: `${title} — ${category}`,
        type: 'complaint_update',
        reference_id: complaint.id,
        reference_type: 'complaint',
      });

      sendCreated(res, 'Complaint submitted', complaint);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) { sendNotFound(res, 'Complaint not found'); return; }

      const { status, admin_note, assigned_to } = req.body;

      const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
      if (!validStatuses.includes(status)) {
        sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
        return;
      }

      await complaint.update({
        status,
        admin_note: admin_note || complaint.admin_note,
        assigned_to: assigned_to || complaint.assigned_to,
        ...(status === 'resolved' ? { resolved_at: new Date() } : {}),
      });

      // Notify the user who raised it
      await notificationService.send({
        user_id: complaint.raised_by,
        title: 'Complaint Status Updated',
        body: `Your complaint "${complaint.title}" is now ${status}.${admin_note ? ` Note: ${admin_note}` : ''}`,
        type: 'complaint_update',
        reference_id: complaint.id,
        reference_type: 'complaint',
      });

      sendSuccess(res, 'Complaint updated', complaint);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { status, category } = req.query;

      const where: any = {};
      const sid = queryId(req);
      if (sid) where.society_id = sid;

      // Regular users see only their own complaints
      if (req.user!.role === 'user') {
        where.raised_by = req.user!.id;
      }

      if (status) where.status = status;
      if (category) where.category = category;

      const { count, rows } = await Complaint.findAndCountAll({
        where,
        include: [
          { model: User, as: 'raisedBy', attributes: ['id', 'name', 'flat_id'] },
          { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [['createdAt', 'DESC']],
      });

      sendSuccess(res, 'Complaints fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaint = await Complaint.findByPk(req.params.id, {
        include: [
          { model: User, as: 'raisedBy', attributes: ['id', 'name'] },
          { model: User, as: 'assignedTo', attributes: ['id', 'name'] },
        ],
      });
      if (!complaint) { sendNotFound(res, 'Complaint not found'); return; }
      sendSuccess(res, 'Complaint fetched', complaint);
    } catch (err) {
      next(err);
    }
  }
}

export default new ComplaintController();

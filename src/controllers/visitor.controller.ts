import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Visitor, User, Flat } from '../models';
import { sendSuccess, sendCreated, sendNotFound, getPagination, getPaginationMeta } from '../utils/response';
import { getRelativePath } from '../utils/upload';
import notificationService from '../services/notification.service';

const bodyId = (req: AuthRequest): number => req.user!.role === 'super_admin' ? req.body.society_id : req.user!.society_id!;
const queryId = (req: AuthRequest): number | undefined => req.user!.role === 'super_admin' ? (req.query.society_id as any) : req.user!.society_id!;

export class VisitorController {
  // Security: create visitor entry
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name, phone, visitor_type, vehicle_number,
        flat_id, purpose, is_pre_approved,
      } = req.body;

      const image = req.file ? getRelativePath(req.file.path) : null;
      const societyId = bodyId(req);

      // Check if visitor has visited before (by phone)
      const existing = await Visitor.findOne({
        where: { phone, society_id: societyId },
        order: [['createdAt', 'DESC']],
      });

      // Get flat's resident(s) to notify
      const residents = await User.findAll({
        where: { flat_id, is_active: true, is_approved: true, role: 'user' },
        attributes: ['id'],
      });

      const visitor = await Visitor.create({
        name: existing ? existing.name : name,
        phone,
        image,
        visitor_type,
        vehicle_number: vehicle_number || null,
        flat_id,
        society_id: societyId,
        created_by: req.user!.id,
        status: is_pre_approved ? 'approved' : 'pending',
        purpose: purpose || null,
        in_time: new Date(),
        is_pre_approved: !!is_pre_approved,
      });

      // Always notify flat residents when security creates a visitor entry
      if (residents.length > 0) {
        const isPreApproved = !!is_pre_approved;
        await notificationService.sendToMany(
          residents.map((r) => r.id),
          {
            title: isPreApproved ? 'Pre-approved Visitor Arrived' : 'Visitor at Gate',
            body: isPreApproved
              ? `${visitor.name} (${visitor_type}) has arrived at the gate.`
              : `${visitor.name} (${visitor_type}) is at the gate. Allow entry?`,
            type: 'visitor_request',
            reference_id: visitor.id,
            reference_type: 'visitor',
          }
        );
      }

      sendCreated(res, 'Visitor entry created', visitor);
    } catch (err) {
      next(err);
    }
  }

  // User: approve or reject visitor
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const visitor = await Visitor.findByPk(req.params.id);
      if (!visitor) { sendNotFound(res, 'Visitor not found'); return; }

      await visitor.update({
        status,
        host_user_id: req.user!.id,
        ...(status === 'checked_out' ? { out_time: new Date() } : {}),
      });

      // Notify security
      if (visitor.created_by) {
        await notificationService.send({
          user_id: visitor.created_by,
          title: `Visitor ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          body: `${visitor.name}'s entry has been ${status} by the resident.`,
          type: status === 'approved' ? 'visitor_approved' : 'visitor_rejected',
          reference_id: visitor.id,
          reference_type: 'visitor',
        });
      }

      sendSuccess(res, `Visitor ${status} successfully`, visitor);
    } catch (err) {
      next(err);
    }
  }

  // Security: mark visitor checkout
  async checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const visitor = await Visitor.findByPk(req.params.id);
      if (!visitor) { sendNotFound(res, 'Visitor not found'); return; }
      await visitor.update({ status: 'checked_out', out_time: new Date() });
      sendSuccess(res, 'Visitor checked out', visitor);
    } catch (err) {
      next(err);
    }
  }

  // Get visitor by phone (auto-fill for repeat visitors)
  async getByPhone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.params;
      const where: any = { phone };
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      const visitor = await Visitor.findOne({
        where,
        order: [['createdAt', 'DESC']],
        attributes: ['name', 'phone', 'image', 'vehicle_number'],
      });
      sendSuccess(res, visitor ? 'Visitor found' : 'New visitor', visitor);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { visitor_type, status, flat_id, date } = req.query;

      const where: any = {};
      const sid = queryId(req);
      if (sid) where.society_id = sid;

      // Regular users only see their flat's visitors
      if (req.user!.role === 'user') {
        where.flat_id = req.user!.dbUser?.flat_id;
      } else if (flat_id) {
        where.flat_id = flat_id;
      }

      if (visitor_type) where.visitor_type = visitor_type;
      if (status) where.status = status;
      if (date) {
        const start = new Date(date as string);
        const end = new Date(date as string);
        end.setDate(end.getDate() + 1);
        where.in_time = { [Op.between]: [start, end] };
      }

      const { count, rows } = await Visitor.findAndCountAll({
        where,
        include: [
          { model: Flat, as: 'flat' },
          { model: User, as: 'host', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [['in_time', 'DESC']],
      });

      sendSuccess(res, 'Visitors fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  // User: pre-approve visitor
  async preApprove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, visitor_type, vehicle_number, pre_approved_date, purpose } = req.body;

      const visitor = await Visitor.create({
        name, phone, visitor_type,
        vehicle_number: vehicle_number || null,
        flat_id: req.user!.dbUser?.flat_id,
        society_id: bodyId(req),
        host_user_id: req.user!.id,
        status: 'approved',
        is_pre_approved: true,
        pre_approved_date: pre_approved_date || null,
        purpose: purpose || null,
      });

      sendCreated(res, 'Visitor pre-approved', visitor);
    } catch (err) {
      next(err);
    }
  }
}

export default new VisitorController();

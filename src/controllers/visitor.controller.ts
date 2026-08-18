import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Visitor, VisitorLog, User, Flat, Block, Staff } from '../models';
import { sendSuccess, sendCreated, sendNotFound, getPagination, getPaginationMeta } from '../utils/response';
import { getRelativePath } from '../utils/upload';
import notificationService from '../services/notification.service';
import logger from '../utils/logger';

const bodyId = (req: AuthRequest): number =>
  req.user!.role === 'super_admin' ? req.body.society_id : req.user!.society_id!;

const queryId = (req: AuthRequest): number | undefined =>
  req.user!.role === 'super_admin' ? (req.query.society_id as any) : req.user!.society_id!;

// Convert any value to a string safe for FCM data payloads
function s(val: any): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

export class VisitorController {

  // POST / — Security creates a new visitor entry (creates/updates visitor profile + new log)
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, visitor_type, vehicle_number, flat_id, purpose, is_pre_approved } = req.body;

      const image = req.file ? getRelativePath(req.file.path) : null;
      const societyId = bodyId(req);

      // multipart/form-data sends everything as strings — parse boolean properly
      const isPreApproved: boolean =
        is_pre_approved === true ||
        is_pre_approved === 'true' ||
        is_pre_approved === 1 ||
        is_pre_approved === '1';

      const validVisitorTypes = ['guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'];
      const validatedType = validVisitorTypes.includes(visitor_type) ? visitor_type : 'guest';

      const parsedFlatId = parseInt(flat_id, 10);
      if (isNaN(parsedFlatId)) {
        res.status(400).json({ success: false, message: 'Invalid flat_id' });
        return;
      }

      // Find or create visitor profile (unique by phone + society)
      const [visitor] = await Visitor.findOrCreate({
        where: { phone, society_id: societyId },
        defaults: {
          name,
          phone,
          image: image || null,
          vehicle_number: vehicle_number || null,
          society_id: societyId,
        },
      });

      // Update image / vehicle_number if new data is provided
      const updates: any = {};
      if (image) updates.image = image;
      if (vehicle_number) updates.vehicle_number = vehicle_number;
      if (Object.keys(updates).length) await visitor.update(updates);

      const isStaff = req.user!.role === 'security';

      // Create visit log entry
      const log = await VisitorLog.create({
        visitor_id: visitor.id,
        visitor_type: validatedType,
        flat_id: parsedFlatId,
        society_id: societyId,
        host_user_id: null,
        created_by: isStaff ? null : req.user!.id,
        created_by_staff: isStaff ? req.user!.id : null,
        status: isPreApproved ? 'approved' : 'pending',
        purpose: purpose || null,
        in_time: new Date(),
        is_pre_approved: isPreApproved,
      });

      // Notify flat residents via push notification + FCM data message
      const residents = await User.findAll({
        where: { flat_id: parsedFlatId, is_active: true, is_approved: true, role: 'user' },
        attributes: ['id'],
      });

      if (residents.length > 0) {
        const notifPayload = {
          title: isPreApproved ? 'Pre-approved Visitor Arrived' : 'Visitor at Gate',
          body: isPreApproved
            ? `${visitor.name} (${validatedType}) has arrived at the gate.`
            : `${visitor.name} (${validatedType}) is at the gate. Allow entry?`,
          type: 'visitor_request' as const,
          reference_id: log.id,
          reference_type: 'visitor' as const,
        };

        // skipPush: the data-only FCM message below already triggers the resident's
        // tray notification (app-formatted "New Visitor"); sending a raw notification
        // here too would show a second, server-formatted "Visitor at Gate" tray entry.
        await notificationService.sendToMany(residents.map((r) => r.id), notifPayload, { skipPush: true });

        // Send real-time data message so the app can show the visitor request instantly
        const fcmData: Record<string, string> = {
          type: 'visitor_request',
          log_id: s(log.id),
          visitor_id: s(visitor.id),
          name: s(visitor.name),
          phone: s(visitor.phone),
          visitor_type: s(log.visitor_type),
          image: s(visitor.image),
          purpose: s(log.purpose),
          status: s(log.status),
          is_pre_approved: s(isPreApproved),
          flat_id: s(log.flat_id),
          society_id: s(log.society_id),
          in_time: s(log.in_time),
        };

        await Promise.allSettled(
          residents.map((r) => notificationService.sendDataToUser(r.id, fcmData))
        );
      }

      sendCreated(res, 'Visitor entry created', { visitor, log });
    } catch (err) {
      next(err);
    }
  }

  // PUT /:id/status — User approves / rejects a visitor log entry
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    // Unique ID per request call — if this appears 3 times in logs, the app is calling the API 3 times
    const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    logger.info(`[updateStatus][${reqId}] ▶ START log_id=${req.params.id} user_id=${req.user!.id} status=${req.body.status}`);

    try {
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
        return;
      }

      // Atomic update — only succeeds if status is still 'pending'.
      // If 3 users tap approve at the same time, MySQL row-lock ensures only
      // the first UPDATE matches; the other 2 get affectedRows=0 and are blocked here.
      const [affectedRows] = await VisitorLog.update(
        { status, host_user_id: req.user!.id },
        { where: { id: req.params.id, status: 'pending' } }
      );

      logger.info(`[updateStatus][${reqId}] affectedRows=${affectedRows} for log_id=${req.params.id}`);

      if (affectedRows === 0) {
        const existing = await VisitorLog.findByPk(req.params.id);
        if (!existing) { sendNotFound(res, 'Visitor log not found'); return; }
        logger.warn(`[updateStatus][${reqId}] BLOCKED — already ${existing.status}, no notification sent`);
        res.status(400).json({ success: false, message: `Visitor is already ${existing.status}` });
        return;
      }

      // Fetch full log with visitor details for notification
      const log = await VisitorLog.findByPk(req.params.id, {
        include: [{ model: Visitor, as: 'visitor' }],
      });
      if (!log) { sendNotFound(res, 'Visitor log not found'); return; }

      const visitor = (log as any).visitor as Visitor;

      const statusTitle = `Visitor ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`;
      const statusBody  = `${visitor?.name}'s entry has been ${status} by the resident.`;

      const fcmData: Record<string, string> = {
        type: 'visitor_status_update',
        log_id: s(log.id),
        visitor_id: s(log.visitor_id),
        name: s(visitor?.name),
        status,
        flat_id: s(log.flat_id),
        society_id: s(log.society_id),
        out_time: s(log.out_time),
        triggered_by: 'resident',
      };

      if (log.created_by_staff) {
        logger.info(`[updateStatus][${reqId}] ✅ Sending 1 notification to staff_id=${log.created_by_staff}`);
        await notificationService.sendAlertToStaff(log.created_by_staff, statusTitle, statusBody, fcmData);
      } else {
        logger.warn(`[updateStatus][${reqId}] ⚠ no created_by_staff on log_id=${log.id} — skipped`);
      }

      logger.info(`[updateStatus][${reqId}] ✔ DONE`);
      sendSuccess(res, `Visitor ${status} successfully`, log);
    } catch (err) {
      next(err);
    }
  }

  // PUT /:id/security-override
  async securityOverrideStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
        return;
      }

      const log = await VisitorLog.findByPk(req.params.id, {
        include: [{ model: Visitor, as: 'visitor' }],
      });
      if (!log) { sendNotFound(res, 'Visitor log not found'); return; }

      if (log.status === 'checked_out') {
        res.status(400).json({ success: false, message: 'Visitor already checked out' });
        return;
      }

      const isOverride = log.status === 'pending';
      const isAck      = log.status === 'approved' && status === 'approved';
      const isVeto     = log.status === 'approved' && status === 'rejected';

      logger.info(
        `[securityOverride] log_id=${log.id} prev=${log.status} new=${status} ` +
        `mode=${isOverride ? 'override' : isAck ? 'ack' : isVeto ? 'veto' : 'update'}`
      );

      await log.update({ status });

      const visitor = (log as any).visitor as Visitor;

      const fcmData: Record<string, string> = {
        type: 'visitor_status_update',
        log_id: s(log.id),
        visitor_id: s(log.visitor_id),
        name: s(visitor?.name),
        status: s(log.status),
        flat_id: s(log.flat_id),
        society_id: s(log.society_id),
        triggered_by: 'security',
      };

      const message = isOverride
        ? `Visitor ${status} by security`
        : isAck
        ? 'Visitor entry confirmed by security'
        : isVeto
        ? 'Visitor entry vetoed by security'
        : `Visitor ${status} by security`;

      // Broadcast status update to ALL security guards in the society
      await notificationService.sendAlertToSocietySecurity(
        log.society_id,
        `Visitor ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
        `${visitor?.name}'s entry was ${status} by security.`,
        fcmData,
      );

      // If security vetoes a resident-approved entry, also notify the flat residents
      if (isVeto) {
        const residents = await User.findAll({
          where: { flat_id: log.flat_id, is_active: true, is_approved: true, role: 'user' },
          attributes: ['id'],
        });
        await notificationService.sendToMany(
          residents.map((r) => r.id),
          {
            title: 'Visitor Entry Vetoed',
            body: `${visitor?.name}'s approved entry was rejected by security.`,
            type: 'visitor_rejected' as any,
            reference_id: log.id,
            reference_type: 'visitor',
          },
        );
        await Promise.allSettled(
          residents.map((r) => notificationService.sendDataToUser(r.id, fcmData))
        );
      }

      sendSuccess(res, message, log);
    } catch (err) {
      next(err);
    }
  }

  // PUT /:id/checkout — Security marks visitor as checked out
  async checkout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await VisitorLog.findByPk(req.params.id, {
        include: [{ model: Visitor, as: 'visitor' }],
      });
      if (!log) { sendNotFound(res, 'Visitor log not found'); return; }

      if (log.status === 'checked_out') {
        res.status(400).json({ success: false, message: 'Visitor already checked out' });
        return;
      }

      await log.update({ status: 'checked_out', out_time: new Date() });

      const visitorName = s((log as any).visitor?.name);
      await notificationService.sendAlertToSocietySecurity(
        log.society_id,
        'Visitor Checked Out',
        `${visitorName || 'Visitor'} has checked out.`,
        {
          type: 'visitor_status_update',
          log_id: s(log.id),
          visitor_id: s(log.visitor_id),
          name: visitorName,
          status: s(log.status),
          flat_id: s(log.flat_id),
          society_id: s(log.society_id),
          in_time: s(log.in_time),
          out_time: s(log.out_time),
          triggered_by: 'security',
        },
      );

      sendSuccess(res, 'Visitor checked out', log);
    } catch (err) {
      next(err);
    }
  }

  // GET /lookup/:phone
  async getByPhone(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.params;
      const sid = queryId(req);

      // Full visitor profile
      const visitor = await Visitor.findOne({
        where: sid ? { phone, society_id: sid } : { phone },
      });

      // New visitor — no profile yet
      if (!visitor) {
        sendSuccess(res, 'New visitor', null);
        return;
      }

      // Last entry log with full associations
      const lastLog = await VisitorLog.findOne({
        where: {
          visitor_id: visitor.id,
          ...(sid ? { society_id: sid } : {}),
        },
        include: [
          {
            model: Flat, as: 'flat',
            attributes: ['id', 'flat_number', 'floor', 'type'],
            include: [{ model: Block, as: 'block', attributes: ['id', 'name'] }],
          },
          { model: User,  as: 'host',           attributes: ['id', 'name', 'phone'] },
          { model: User,  as: 'createdByUser',   attributes: ['id', 'name', 'phone'] },
          { model: Staff, as: 'createdByStaff',  attributes: ['id', 'name', 'phone'] },
        ],
        order: [['in_time', 'DESC']],
      });

      // Total visit count (all time)
      const totalVisits = await VisitorLog.count({ where: { visitor_id: visitor.id } });

      sendSuccess(res, 'Visitor found', {
        visitor,
        total_visits: totalVisits,
        last_log: lastLog,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET / — List all visitor logs
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { visitor_type, status, flat_id, date, start_date, end_date, search } = req.query;

      const where: any = {};
      const sid = queryId(req);
      if (sid) where.society_id = sid;

      if (req.user!.role === 'user') {
        where.flat_id = req.user!.dbUser?.flat_id;
      } else if (flat_id) {
        where.flat_id = flat_id;
      }

      if (visitor_type) where.visitor_type = visitor_type;
      if (status) where.status = status;

      if (date) {
        const start = new Date(date as string); start.setHours(0, 0, 0, 0);
        const end = new Date(date as string); end.setHours(23, 59, 59, 999);
        where.in_time = { [Op.between]: [start, end] };
      } else if (start_date || end_date) {
        const range: any = {};
        if (start_date) { const s2 = new Date(start_date as string); s2.setHours(0, 0, 0, 0); range[Op.gte] = s2; }
        if (end_date) { const e = new Date(end_date as string); e.setHours(23, 59, 59, 999); range[Op.lte] = e; }
        where.in_time = range;
      }

      const visitorWhere: any = {};
      if (search) {
        visitorWhere[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await VisitorLog.findAndCountAll({
        where,
        include: [
          {
            model: Visitor, as: 'visitor',
            attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
            where: Object.keys(visitorWhere).length ? visitorWhere : undefined,
            required: Object.keys(visitorWhere).length > 0,
          },
          { model: Flat, as: 'flat' },
          { model: User, as: 'host', attributes: ['id', 'name'] },
          { model: Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [['in_time', 'DESC']],
        distinct: true,
      });

      sendSuccess(res, 'Visitor logs fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  // GET /:id/logs — All visit logs for a specific visitor profile
  async getVisitorLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const visitorId = parseInt(req.params.id, 10);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const visitor = await Visitor.findByPk(visitorId, {
        attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
      });
      if (!visitor) { sendNotFound(res, 'Visitor not found'); return; }

      const where: any = { visitor_id: visitorId };
      const sid = queryId(req);
      if (sid) where.society_id = sid;

      const { count, rows } = await VisitorLog.findAndCountAll({
        where,
        include: [
          { model: Flat, as: 'flat', attributes: ['id', 'flat_number'] },
          { model: User, as: 'host', attributes: ['id', 'name'] },
          { model: Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
        ],
        ...getPagination(page, limit),
        order: [['in_time', 'DESC']],
      });

      sendSuccess(res, 'Visitor logs fetched', { visitor, logs: rows }, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  // GET /pending-requests
  async getRecentPendingRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const seconds = parseInt(req.query.seconds as string) || 30;
      const since = new Date(Date.now() - seconds * 1000);

      const where: any = {
        status: 'pending',
        createdAt: { [Op.gte]: since },
      };

      if (req.user!.role === 'user') {
        where.flat_id = req.user!.dbUser?.flat_id;
        where.society_id = req.user!.society_id;
      } else {
        const sid = queryId(req);
        if (sid) where.society_id = sid;
        if (req.query.flat_id) where.flat_id = req.query.flat_id;
      }

      const requests = await VisitorLog.findAll({
        where,
        include: [
          {
            model: Visitor,
            as: 'visitor',
            attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
          },
          { model: Flat, as: 'flat', attributes: ['id', 'flat_number'] },
          { model: Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      sendSuccess(res, 'Pending requests fetched', {
        has_pending: requests.length > 0,
        count: requests.length,
        requests,
        checked_window_seconds: seconds,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /scan/:uuid — Security scans visitor QR code (uuid = visitor-log uuid OR visitor uuid)
  async scanQR(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uuid } = req.params;
      const societyId = queryId(req);

      // ── Step 1: Try to match a specific visitor LOG uuid first ────────────
      let log = await VisitorLog.findOne({
        where: { uuid },
        include: [
          {
            model: Visitor, as: 'visitor',
            attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
          },
          {
            model: Flat, as: 'flat',
            attributes: ['id', 'flat_number', 'floor', 'type'],
            include: [{ model: Block, as: 'block', attributes: ['id', 'name'] }],
          },
          { model: User, as: 'host', attributes: ['id', 'name', 'phone'] },
          { model: User, as: 'createdByUser', attributes: ['id', 'name', 'phone'] },
          { model: Staff, as: 'createdByStaff', attributes: ['id', 'name', 'phone'] },
        ],
      });

      // ── Step 2: If no log found, treat uuid as a VISITOR profile uuid ────
      let visitor: any = null;
      if (!log) {
        visitor = await Visitor.findOne({ where: { uuid } });
        if (!visitor) { sendNotFound(res, 'No visitor or visit record found for this QR code'); return; }

        // Get the most recent active (non-checked-out) log for this visitor in the society
        const logWhere: any = { visitor_id: visitor.id };
        if (societyId) logWhere.society_id = societyId;

        log = await VisitorLog.findOne({
          where: { ...logWhere, status: { [Op.in]: ['pending', 'approved'] } },
          order: [['in_time', 'DESC']],
          include: [
            {
              model: Flat, as: 'flat',
              attributes: ['id', 'flat_number', 'floor', 'type'],
              include: [{ model: Block, as: 'block', attributes: ['id', 'name'] }],
            },
            { model: User, as: 'host', attributes: ['id', 'name', 'phone'] },
            { model: User, as: 'createdByUser', attributes: ['id', 'name', 'phone'] },
            { model: Staff, as: 'createdByStaff', attributes: ['id', 'name', 'phone'] },
          ],
        });
      } else {
        visitor = (log as any).visitor;
      }

      // ── Step 3: Total visit count for this visitor ────────────────────────
      const totalVisits = await VisitorLog.count({
        where: { visitor_id: visitor.id, status: { [Op.ne]: 'rejected' } },
      });

      // ── Step 4: Flat residents (who can approve) ──────────────────────────
      let residents: any[] = [];
      if (log) {
        residents = await User.findAll({
          where: {
            flat_id: (log as any).flat_id,
            is_active: true,
            is_approved: true,
            role: 'user',
          },
          attributes: ['id', 'name', 'phone'],
        });
      }

      // ── Step 5: Recent visit history (last 5 visits) ─────────────────────
      const recentLogs = await VisitorLog.findAll({
        where: { visitor_id: visitor.id },
        attributes: ['id', 'visitor_type', 'status', 'in_time', 'out_time', 'purpose', 'is_pre_approved'],
        order: [['in_time', 'DESC']],
        limit: 5,
      });

      // ── Build response ────────────────────────────────────────────────────
      const logJson = log ? (log as any).toJSON() : null;

      sendSuccess(res, 'Visitor data fetched', {
        visitor: {
          id: visitor.id,
          uuid: visitor.uuid,
          name: visitor.name,
          phone: visitor.phone,
          image: visitor.image ?? null,
          vehicle_number: visitor.vehicle_number ?? null,
          total_visits: totalVisits,
        },
        current_log: logJson
          ? {
              id: logJson.id,
              uuid: logJson.uuid,
              status: logJson.status,
              visitor_type: logJson.visitor_type,
              purpose: logJson.purpose ?? null,
              in_time: logJson.in_time,
              out_time: logJson.out_time ?? null,
              is_pre_approved: logJson.is_pre_approved,
              pre_approved_date: logJson.pre_approved_date ?? null,
            }
          : null,
        flat: logJson?.flat
          ? {
              id: logJson.flat.id,
              flat_number: logJson.flat.flat_number,
              floor: logJson.flat.floor ?? null,
              type: logJson.flat.type ?? null,
              block: logJson.flat.block
                ? { id: logJson.flat.block.id, name: logJson.flat.block.name }
                : null,
            }
          : null,
        host: logJson?.host
          ? { id: logJson.host.id, name: logJson.host.name, phone: logJson.host.phone }
          : null,
        created_by_resident: logJson?.createdByUser
          ? { id: logJson.createdByUser.id, name: logJson.createdByUser.name, phone: logJson.createdByUser.phone }
          : null,
        created_by_staff: logJson?.createdByStaff
          ? { id: logJson.createdByStaff.id, name: logJson.createdByStaff.name, phone: logJson.createdByStaff.phone }
          : null,
        residents,
        visit_history: recentLogs,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /pre-approve — User pre-approves an upcoming visitor
  async preApprove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, visitor_type, vehicle_number, pre_approved_date, purpose } = req.body;
      const societyId = bodyId(req);

      const [visitor] = await Visitor.findOrCreate({
        where: { phone, society_id: societyId },
        defaults: { name, phone, vehicle_number: vehicle_number || null, society_id: societyId },
      });

      const log = await VisitorLog.create({
        visitor_id: visitor.id,
        visitor_type: visitor_type || 'guest',
        flat_id: req.user!.dbUser?.flat_id,
        society_id: societyId,
        host_user_id: req.user!.id,
        status: 'approved',
        is_pre_approved: true,
        pre_approved_date: pre_approved_date || null,
        purpose: purpose || null,
        in_time: pre_approved_date ? new Date(pre_approved_date) : new Date(),
      });

      sendCreated(res, 'Visitor pre-approved', { visitor, log });
    } catch (err) {
      next(err);
    }
  }
}

export default new VisitorController();

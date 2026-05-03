import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Staff, DailyHelper, HelperEntryLog, Event, ServiceContact, SocietyPolicy, Amenity } from '../models';
import { sendSuccess, sendCreated, sendNotFound, getPagination, getPaginationMeta } from '../utils/response';
import { getRelativePath } from '../utils/upload';

const bodyId = (req: AuthRequest): number => req.user!.role === 'super_admin' ? req.body.society_id : req.user!.society_id!;
const queryId = (req: AuthRequest): number | undefined => req.user!.role === 'super_admin' ? (req.query.society_id as any) : req.user!.society_id!;

// ─── Staff Controller ─────────────────────────────────────────────────────────
export class StaffController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, email, dob, gender, staff_type, salary, salary_type, address, joining_date, password } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const image = files?.image?.[0] ? getRelativePath(files.image[0].path) : null;
      const documents = files?.documents
        ? files.documents.map((f) => getRelativePath(f.path))
        : null;

      const staff = await Staff.create({
        name, phone, email, dob, gender, staff_type,
        salary: salary || null, salary_type,
        address, documents, image,
        password: password || null,
        joining_date: joining_date || null,
        society_id: bodyId(req),
        created_by: req.user!.id,
      });
      sendCreated(res, 'Staff created', staff);
    } catch (err) { next(err); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const where: any = {};
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      if (req.query.staff_type) where.staff_type = req.query.staff_type;

      const { count, rows } = await Staff.findAndCountAll({
        where, ...getPagination(page, limit), order: [['name', 'ASC']],
      });
      sendSuccess(res, 'Staff fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) { next(err); }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await Staff.findByPk(req.params.id);
      if (!staff) { sendNotFound(res, 'Staff not found'); return; }
      sendSuccess(res, 'Staff fetched', staff);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await Staff.findByPk(req.params.id);
      if (!staff) { sendNotFound(res, 'Staff not found'); return; }
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const image = files?.image?.[0] ? getRelativePath(files.image[0].path) : undefined;
      const documents = files?.documents
        ? files.documents.map((f) => getRelativePath(f.path))
        : undefined;
      const { password, ...rest } = req.body;
      await staff.update({
        ...rest,
        ...(image ? { image } : {}),
        ...(documents ? { documents } : {}),
        ...(password ? { password } : {}),
      });
      sendSuccess(res, 'Staff updated', staff);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const staff = await Staff.findByPk(req.params.id);
      if (!staff) { sendNotFound(res, 'Staff not found'); return; }
      await staff.destroy();
      sendSuccess(res, 'Staff deleted');
    } catch (err) { next(err); }
  }
}

// ─── DailyHelper Controller ───────────────────────────────────────────────────
export class DailyHelperController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, helper_type, allowed_days, allowed_time_start, allowed_time_end } = req.body;
      const image = req.file ? getRelativePath(req.file.path) : null;

      const helper = await DailyHelper.create({
        name, phone, helper_type, image,
        allowed_days: allowed_days || null,
        allowed_time_start: allowed_time_start || null,
        allowed_time_end: allowed_time_end || null,
        user_id: req.user!.id,
        flat_id: req.user!.dbUser?.flat_id,
        society_id: bodyId(req),
      });
      sendCreated(res, 'Daily helper added', helper);
    } catch (err) { next(err); }
  }

  async getMyHelpers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const helpers = await DailyHelper.findAll({
        where: { user_id: req.user!.id, is_active: true },
        order: [['name', 'ASC']],
      });
      sendSuccess(res, 'Daily helpers fetched', helpers);
    } catch (err) { next(err); }
  }

  async getAllForSociety(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const where: any = {};
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      const { count, rows } = await DailyHelper.findAndCountAll({
        where,
        ...getPagination(page, limit),
        order: [['name', 'ASC']],
      });
      sendSuccess(res, 'All helpers fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) { next(err); }
  }

  async logEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { daily_helper_id } = req.body;
      const isStaff = req.user!.role === 'security';
      const log = await HelperEntryLog.create({
        daily_helper_id,
        society_id: bodyId(req),
        in_time: new Date(),
        created_by: isStaff ? null : req.user!.id,
        created_by_staff: isStaff ? req.user!.id : null,
      });
      sendCreated(res, 'Entry logged', log);
    } catch (err) { next(err); }
  }

  async logExit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await HelperEntryLog.findOne({
        where: { daily_helper_id: req.params.helper_id, out_time: null },
        order: [['in_time', 'DESC']],
      });
      if (!log) { sendNotFound(res, 'Active entry not found'); return; }
      await log.update({ out_time: new Date() });
      sendSuccess(res, 'Exit logged', log);
    } catch (err) { next(err); }
  }
}

// ─── Event Controller ─────────────────────────────────────────────────────────
export class EventController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, venue, start_time, end_time, category } = req.body;
      const image = req.file ? getRelativePath(req.file.path) : null;

      const event = await Event.create({
        title, description, venue, image,
        start_time: new Date(start_time),
        end_time: end_time ? new Date(end_time) : null,
        category: category || 'other',
        society_id: bodyId(req),
        created_by: req.user!.id,
      });
      sendCreated(res, 'Event created', event);
    } catch (err) { next(err); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const where: any = { is_active: true };
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      const { count, rows } = await Event.findAndCountAll({
        where,
        ...getPagination(page, limit),
        order: [['start_time', 'ASC']],
      });
      sendSuccess(res, 'Events fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) { sendNotFound(res, 'Event not found'); return; }
      const image = req.file ? getRelativePath(req.file.path) : undefined;
      await event.update({ ...req.body, ...(image ? { image } : {}) });
      sendSuccess(res, 'Event updated', event);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) { sendNotFound(res, 'Event not found'); return; }
      await event.destroy();
      sendSuccess(res, 'Event deleted');
    } catch (err) { next(err); }
  }
}

// ─── ServiceContact Controller ────────────────────────────────────────────────
export class ServiceContactController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, alternate_phone, service_type, description } = req.body;
      const contact = await ServiceContact.create({
        name, phone, alternate_phone: alternate_phone || null,
        service_type, description: description || null,
        society_id: bodyId(req),
        created_by: req.user!.id,
      });
      sendCreated(res, 'Service contact added', contact);
    } catch (err) { next(err); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const where: any = { is_active: true };
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      if (req.query.service_type) where.service_type = req.query.service_type;
      const contacts = await ServiceContact.findAll({ where, order: [['name', 'ASC']] });
      sendSuccess(res, 'Service contacts fetched', contacts);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await ServiceContact.findByPk(req.params.id);
      if (!contact) { sendNotFound(res, 'Contact not found'); return; }
      await contact.update(req.body);
      sendSuccess(res, 'Contact updated', contact);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contact = await ServiceContact.findByPk(req.params.id);
      if (!contact) { sendNotFound(res, 'Contact not found'); return; }
      await contact.destroy();
      sendSuccess(res, 'Contact deleted');
    } catch (err) { next(err); }
  }
}

// ─── Policy Controller ────────────────────────────────────────────────────────
export class PolicyController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, category } = req.body;
      const policy = await SocietyPolicy.create({
        title, description, category: category || 'general',
        society_id: bodyId(req),
        created_by: req.user!.id,
      });
      sendCreated(res, 'Policy created', policy);
    } catch (err) { next(err); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const where: any = { is_active: true };
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      const policies = await SocietyPolicy.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });
      sendSuccess(res, 'Policies fetched', policies);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await SocietyPolicy.findByPk(req.params.id);
      if (!policy) { sendNotFound(res, 'Policy not found'); return; }
      await policy.update({ ...req.body, updated_by: req.user!.id });
      sendSuccess(res, 'Policy updated', policy);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const policy = await SocietyPolicy.findByPk(req.params.id);
      if (!policy) { sendNotFound(res, 'Policy not found'); return; }
      await policy.destroy();
      sendSuccess(res, 'Policy deleted');
    } catch (err) { next(err); }
  }
}

// ─── Amenity Controller ───────────────────────────────────────────────────────
export class AmenityController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, category, timing_open, timing_close } = req.body;
      const image = req.file ? getRelativePath(req.file.path) : null;

      const amenity = await Amenity.create({
        name, description: description || null, category: category || 'common',
        timing_open: timing_open || null, timing_close: timing_close || null,
        image, society_id: bodyId(req),
        created_by: req.user!.id,
      });
      sendCreated(res, 'Amenity added', amenity);
    } catch (err) { next(err); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const where: any = { is_active: true };
      const sid = queryId(req);
      if (sid) where.society_id = sid;
      const amenities = await Amenity.findAll({
        where,
        order: [['name', 'ASC']],
      });
      sendSuccess(res, 'Amenities fetched', amenities);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const amenity = await Amenity.findByPk(req.params.id);
      if (!amenity) { sendNotFound(res, 'Amenity not found'); return; }
      const image = req.file ? getRelativePath(req.file.path) : undefined;
      await amenity.update({ ...req.body, ...(image ? { image } : {}) });
      sendSuccess(res, 'Amenity updated', amenity);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const amenity = await Amenity.findByPk(req.params.id);
      if (!amenity) { sendNotFound(res, 'Amenity not found'); return; }
      await amenity.destroy();
      sendSuccess(res, 'Amenity deleted');
    } catch (err) { next(err); }
  }
}

export const staffController = new StaffController();
export const dailyHelperController = new DailyHelperController();
export const eventController = new EventController();
export const serviceContactController = new ServiceContactController();
export const policyController = new PolicyController();
export const amenityController = new AmenityController();

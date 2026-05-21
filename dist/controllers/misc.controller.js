"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amenityController = exports.policyController = exports.serviceContactController = exports.eventController = exports.dailyHelperController = exports.staffController = exports.AmenityController = exports.PolicyController = exports.ServiceContactController = exports.EventController = exports.DailyHelperController = exports.StaffController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const upload_1 = require("../utils/upload");
const bodyId = (req) => req.user.role === 'super_admin' ? req.body.society_id : req.user.society_id;
const queryId = (req) => req.user.role === 'super_admin' ? req.query.society_id : req.user.society_id;
// ─── Staff Controller ─────────────────────────────────────────────────────────
class StaffController {
    async create(req, res, next) {
        try {
            const { name, phone, email, dob, gender, staff_type, salary, salary_type, address, joining_date, password } = req.body;
            const files = req.files;
            const image = files?.image?.[0] ? (0, upload_1.getRelativePath)(files.image[0].path) : null;
            const documents = files?.documents
                ? files.documents.map((f) => (0, upload_1.getRelativePath)(f.path))
                : null;
            const staff = await models_1.Staff.create({
                name, phone, email, dob, gender, staff_type,
                salary: salary || null, salary_type,
                address, documents, image,
                password: password || null,
                joining_date: joining_date || null,
                society_id: bodyId(req),
                created_by: req.user.id,
            });
            (0, response_1.sendCreated)(res, 'Staff created', staff);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const where = {};
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            if (req.query.staff_type)
                where.staff_type = req.query.staff_type;
            const { count, rows } = await models_1.Staff.findAndCountAll({
                where, ...(0, response_1.getPagination)(page, limit), order: [['name', 'ASC']],
            });
            (0, response_1.sendSuccess)(res, 'Staff fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        try {
            const staff = await models_1.Staff.findByPk(req.params.id);
            if (!staff) {
                (0, response_1.sendNotFound)(res, 'Staff not found');
                return;
            }
            (0, response_1.sendSuccess)(res, 'Staff fetched', staff);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const staff = await models_1.Staff.findByPk(req.params.id);
            if (!staff) {
                (0, response_1.sendNotFound)(res, 'Staff not found');
                return;
            }
            const files = req.files;
            const image = files?.image?.[0] ? (0, upload_1.getRelativePath)(files.image[0].path) : undefined;
            const documents = files?.documents
                ? files.documents.map((f) => (0, upload_1.getRelativePath)(f.path))
                : undefined;
            const { password, ...rest } = req.body;
            await staff.update({
                ...rest,
                ...(image ? { image } : {}),
                ...(documents ? { documents } : {}),
                ...(password ? { password } : {}),
            });
            (0, response_1.sendSuccess)(res, 'Staff updated', staff);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const staff = await models_1.Staff.findByPk(req.params.id);
            if (!staff) {
                (0, response_1.sendNotFound)(res, 'Staff not found');
                return;
            }
            await staff.destroy();
            (0, response_1.sendSuccess)(res, 'Staff deleted');
        }
        catch (err) {
            next(err);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const staff = await models_1.Staff.findByPk(req.user.id);
            if (!staff) {
                (0, response_1.sendNotFound)(res, 'Staff not found');
                return;
            }
            const { name, email } = req.body;
            await staff.update({ ...(name ? { name } : {}), ...(email ? { email } : {}) });
            (0, response_1.sendSuccess)(res, 'Profile updated', staff);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.StaffController = StaffController;
// ─── DailyHelper Controller ───────────────────────────────────────────────────
class DailyHelperController {
    async create(req, res, next) {
        try {
            const { name, phone, helper_type, allowed_days, allowed_time_start, allowed_time_end } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            const helper = await models_1.DailyHelper.create({
                name, phone, helper_type, image,
                allowed_days: allowed_days || null,
                allowed_time_start: allowed_time_start || null,
                allowed_time_end: allowed_time_end || null,
                user_id: req.user.id,
                flat_id: req.user.dbUser?.flat_id,
                society_id: bodyId(req),
            });
            (0, response_1.sendCreated)(res, 'Daily helper added', helper);
        }
        catch (err) {
            next(err);
        }
    }
    async getMyHelpers(req, res, next) {
        try {
            const helpers = await models_1.DailyHelper.findAll({
                where: { user_id: req.user.id, is_active: true },
                order: [['name', 'ASC']],
            });
            (0, response_1.sendSuccess)(res, 'Daily helpers fetched', helpers);
        }
        catch (err) {
            next(err);
        }
    }
    async getAllForSociety(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const where = {};
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const { count, rows } = await models_1.DailyHelper.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.HelperEntryLog,
                        as: 'entryLogs',
                        required: false,
                        where: { in_time: { [sequelize_1.Op.between]: [todayStart, todayEnd] } },
                        attributes: ['id', 'in_time', 'out_time'],
                    },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['name', 'ASC']],
                distinct: true,
            });
            const result = rows.map((helper) => {
                const logs = (helper.entryLogs ?? []).sort((a, b) => new Date(b.in_time).getTime() - new Date(a.in_time).getTime());
                const latestLog = logs[0] ?? null;
                const helperData = helper.toJSON();
                delete helperData.entryLogs;
                // isEntry=1 only if currently inside (entered but not yet exited)
                const currentlyInside = latestLog && !latestLog.out_time;
                return {
                    ...helperData,
                    isEntry: currentlyInside ? '1' : '0',
                    isExit: latestLog?.out_time ? '1' : null,
                };
            });
            (0, response_1.sendSuccess)(res, 'All helpers fetched', result, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async logEntry(req, res, next) {
        try {
            const { daily_helper_id } = req.body;
            const isStaff = req.user.role === 'security';
            const log = await models_1.HelperEntryLog.create({
                daily_helper_id,
                society_id: bodyId(req),
                in_time: new Date(),
                created_by: isStaff ? null : req.user.id,
                created_by_staff: isStaff ? req.user.id : null,
            });
            (0, response_1.sendCreated)(res, 'Entry logged', log);
        }
        catch (err) {
            next(err);
        }
    }
    async logExit(req, res, next) {
        try {
            const log = await models_1.HelperEntryLog.findOne({
                where: { daily_helper_id: req.params.helper_id, out_time: null },
                order: [['in_time', 'DESC']],
            });
            if (!log) {
                (0, response_1.sendNotFound)(res, 'Active entry not found');
                return;
            }
            await log.update({ out_time: new Date() });
            (0, response_1.sendSuccess)(res, 'Exit logged', log);
        }
        catch (err) {
            next(err);
        }
    }
    async getLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { helper_id, date, start_date, end_date } = req.query;
            const where = {};
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            if (helper_id)
                where.daily_helper_id = helper_id;
            if (date) {
                const s = new Date(date);
                s.setHours(0, 0, 0, 0);
                const e = new Date(date);
                e.setHours(23, 59, 59, 999);
                where.in_time = { [sequelize_1.Op.between]: [s, e] };
            }
            else if (start_date || end_date) {
                const range = {};
                if (start_date) {
                    const s = new Date(start_date);
                    s.setHours(0, 0, 0, 0);
                    range[sequelize_1.Op.gte] = s;
                }
                if (end_date) {
                    const e = new Date(end_date);
                    e.setHours(23, 59, 59, 999);
                    range[sequelize_1.Op.lte] = e;
                }
                where.in_time = range;
            }
            const { count, rows } = await models_1.HelperEntryLog.findAndCountAll({
                where,
                include: [{ model: models_1.DailyHelper, as: 'helper', attributes: ['id', 'name', 'phone', 'helper_type', 'image'] }],
                ...(0, response_1.getPagination)(page, limit),
                order: [['in_time', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Helper entry logs fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DailyHelperController = DailyHelperController;
// ─── Event Controller ─────────────────────────────────────────────────────────
class EventController {
    async create(req, res, next) {
        try {
            const { title, description, venue, start_time, end_time, category } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            const event = await models_1.Event.create({
                title, description, venue, image,
                start_time: new Date(start_time),
                end_time: end_time ? new Date(end_time) : null,
                category: category || 'other',
                society_id: bodyId(req),
                created_by: req.user.id,
            });
            (0, response_1.sendCreated)(res, 'Event created', event);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const where = { is_active: true };
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            const { count, rows } = await models_1.Event.findAndCountAll({
                where,
                ...(0, response_1.getPagination)(page, limit),
                order: [['start_time', 'ASC']],
            });
            (0, response_1.sendSuccess)(res, 'Events fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const event = await models_1.Event.findByPk(req.params.id);
            if (!event) {
                (0, response_1.sendNotFound)(res, 'Event not found');
                return;
            }
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : undefined;
            await event.update({ ...req.body, ...(image ? { image } : {}) });
            (0, response_1.sendSuccess)(res, 'Event updated', event);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const event = await models_1.Event.findByPk(req.params.id);
            if (!event) {
                (0, response_1.sendNotFound)(res, 'Event not found');
                return;
            }
            await event.destroy();
            (0, response_1.sendSuccess)(res, 'Event deleted');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EventController = EventController;
// ─── ServiceContact Controller ────────────────────────────────────────────────
class ServiceContactController {
    async create(req, res, next) {
        try {
            const { name, phone, alternate_phone, service_type, description } = req.body;
            const contact = await models_1.ServiceContact.create({
                name, phone, alternate_phone: alternate_phone || null,
                service_type, description: description || null,
                society_id: bodyId(req),
                created_by: req.user.id,
            });
            (0, response_1.sendCreated)(res, 'Service contact added', contact);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const where = { is_active: true };
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            if (req.query.service_type)
                where.service_type = req.query.service_type;
            const contacts = await models_1.ServiceContact.findAll({ where, order: [['name', 'ASC']] });
            (0, response_1.sendSuccess)(res, 'Service contacts fetched', contacts);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const contact = await models_1.ServiceContact.findByPk(req.params.id);
            if (!contact) {
                (0, response_1.sendNotFound)(res, 'Contact not found');
                return;
            }
            await contact.update(req.body);
            (0, response_1.sendSuccess)(res, 'Contact updated', contact);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const contact = await models_1.ServiceContact.findByPk(req.params.id);
            if (!contact) {
                (0, response_1.sendNotFound)(res, 'Contact not found');
                return;
            }
            await contact.destroy();
            (0, response_1.sendSuccess)(res, 'Contact deleted');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ServiceContactController = ServiceContactController;
// ─── Policy Controller ────────────────────────────────────────────────────────
class PolicyController {
    async create(req, res, next) {
        try {
            const { title, description, category } = req.body;
            const policy = await models_1.SocietyPolicy.create({
                title, description, category: category || 'general',
                society_id: bodyId(req),
                created_by: req.user.id,
            });
            (0, response_1.sendCreated)(res, 'Policy created', policy);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const where = { is_active: true };
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            const policies = await models_1.SocietyPolicy.findAll({
                where,
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Policies fetched', policies);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const policy = await models_1.SocietyPolicy.findByPk(req.params.id);
            if (!policy) {
                (0, response_1.sendNotFound)(res, 'Policy not found');
                return;
            }
            await policy.update({ ...req.body, updated_by: req.user.id });
            (0, response_1.sendSuccess)(res, 'Policy updated', policy);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const policy = await models_1.SocietyPolicy.findByPk(req.params.id);
            if (!policy) {
                (0, response_1.sendNotFound)(res, 'Policy not found');
                return;
            }
            await policy.destroy();
            (0, response_1.sendSuccess)(res, 'Policy deleted');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PolicyController = PolicyController;
// ─── Amenity Controller ───────────────────────────────────────────────────────
class AmenityController {
    async create(req, res, next) {
        try {
            const { name, description, category, timing_open, timing_close } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            const amenity = await models_1.Amenity.create({
                name, description: description || null, category: category || 'common',
                timing_open: timing_open || null, timing_close: timing_close || null,
                image, society_id: bodyId(req),
                created_by: req.user.id,
            });
            (0, response_1.sendCreated)(res, 'Amenity added', amenity);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const where = { is_active: true };
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            const amenities = await models_1.Amenity.findAll({
                where,
                order: [['name', 'ASC']],
            });
            (0, response_1.sendSuccess)(res, 'Amenities fetched', amenities);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const amenity = await models_1.Amenity.findByPk(req.params.id);
            if (!amenity) {
                (0, response_1.sendNotFound)(res, 'Amenity not found');
                return;
            }
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : undefined;
            await amenity.update({ ...req.body, ...(image ? { image } : {}) });
            (0, response_1.sendSuccess)(res, 'Amenity updated', amenity);
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const amenity = await models_1.Amenity.findByPk(req.params.id);
            if (!amenity) {
                (0, response_1.sendNotFound)(res, 'Amenity not found');
                return;
            }
            await amenity.destroy();
            (0, response_1.sendSuccess)(res, 'Amenity deleted');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AmenityController = AmenityController;
exports.staffController = new StaffController();
exports.dailyHelperController = new DailyHelperController();
exports.eventController = new EventController();
exports.serviceContactController = new ServiceContactController();
exports.policyController = new PolicyController();
exports.amenityController = new AmenityController();
//# sourceMappingURL=misc.controller.js.map
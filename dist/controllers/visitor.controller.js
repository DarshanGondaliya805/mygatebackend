"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const upload_1 = require("../utils/upload");
const notification_service_1 = __importDefault(require("../services/notification.service"));
const socket_service_1 = __importDefault(require("../services/socket.service"));
const bodyId = (req) => req.user.role === 'super_admin' ? req.body.society_id : req.user.society_id;
const queryId = (req) => req.user.role === 'super_admin' ? req.query.society_id : req.user.society_id;
class VisitorController {
    // POST / — Security creates a new visitor entry (creates/updates visitor profile + new log)
    async create(req, res, next) {
        try {
            const { name, phone, visitor_type, vehicle_number, flat_id, purpose, is_pre_approved } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            const societyId = bodyId(req);
            const validVisitorTypes = ['guest', 'delivery', 'cab', 'courier', 'maintenance', 'other'];
            const validatedType = validVisitorTypes.includes(visitor_type) ? visitor_type : 'guest';
            const parsedFlatId = parseInt(flat_id, 10);
            if (isNaN(parsedFlatId)) {
                res.status(400).json({ success: false, message: 'Invalid flat_id' });
                return;
            }
            // Find or create visitor profile (unique by phone + society)
            const [visitor] = await models_1.Visitor.findOrCreate({
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
            const updates = {};
            if (image)
                updates.image = image;
            if (vehicle_number)
                updates.vehicle_number = vehicle_number;
            if (Object.keys(updates).length)
                await visitor.update(updates);
            const isStaff = req.user.role === 'security';
            // Create visit log entry
            const log = await models_1.VisitorLog.create({
                visitor_id: visitor.id,
                visitor_type: validatedType,
                flat_id: parsedFlatId,
                society_id: societyId,
                host_user_id: null,
                created_by: isStaff ? null : req.user.id,
                created_by_staff: isStaff ? req.user.id : null,
                status: !is_pre_approved ? 'approved' : 'pending',
                purpose: purpose || null,
                in_time: new Date(),
                is_pre_approved: !!is_pre_approved,
            });
            // Notify flat residents
            const residents = await models_1.User.findAll({
                where: { flat_id: parsedFlatId, is_active: true, is_approved: true, role: 'user' },
                attributes: ['id'],
            });
            if (residents.length > 0) {
                const notifPayload = {
                    title: is_pre_approved ? 'Pre-approved Visitor Arrived' : 'Visitor at Gate',
                    body: is_pre_approved
                        ? `${visitor.name} (${validatedType}) has arrived at the gate.`
                        : `${visitor.name} (${validatedType}) is at the gate. Allow entry?`,
                    type: 'visitor_request',
                    reference_id: log.id,
                    reference_type: 'visitor',
                };
                await notification_service_1.default.sendToMany(residents.map((r) => r.id), notifPayload);
                for (const r of residents) {
                    socket_service_1.default.emitToUser(r.id, 'visitor_request', {
                        log_id: log.id,
                        visitor_id: visitor.id,
                        name: visitor.name,
                        phone: visitor.phone,
                        visitor_type: log.visitor_type,
                        image: visitor.image,
                        purpose: log.purpose,
                        status: log.status,
                        is_pre_approved: log.is_pre_approved,
                        flat_id: log.flat_id,
                        society_id: log.society_id,
                        in_time: log.in_time,
                    });
                }
            }
            (0, response_1.sendCreated)(res, 'Visitor entry created', { visitor, log });
        }
        catch (err) {
            next(err);
        }
    }
    // PUT /:id/status — User approves / rejects a visitor log entry
    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const log = await models_1.VisitorLog.findByPk(req.params.id, {
                include: [{ model: models_1.Visitor, as: 'visitor' }],
            });
            if (!log) {
                (0, response_1.sendNotFound)(res, 'Visitor log not found');
                return;
            }
            await log.update({
                status,
                host_user_id: req.user.id,
                ...(status === 'checked_out' ? { out_time: new Date() } : {}),
            });
            const visitor = log.visitor;
            // Notify the security guard who created the entry
            if (log.created_by) {
                await notification_service_1.default.send({
                    user_id: log.created_by,
                    title: `Visitor ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                    body: `${visitor?.name}'s entry has been ${status} by the resident.`,
                    type: status === 'approved' ? 'visitor_approved' : 'visitor_rejected',
                    reference_id: log.id,
                    reference_type: 'visitor',
                });
                socket_service_1.default.emitToUser(log.created_by, 'visitor_status_update', {
                    log_id: log.id,
                    visitor_id: log.visitor_id,
                    name: visitor?.name,
                    status: log.status,
                    flat_id: log.flat_id,
                    society_id: log.society_id,
                    out_time: log.out_time,
                });
            }
            // Broadcast to all security in the society
            socket_service_1.default.emitToSocietySecurity(log.society_id, 'visitor_status_update', {
                log_id: log.id,
                visitor_id: log.visitor_id,
                name: visitor?.name,
                status: log.status,
                flat_id: log.flat_id,
                society_id: log.society_id,
                out_time: log.out_time,
            });
            (0, response_1.sendSuccess)(res, `Visitor ${status} successfully`, log);
        }
        catch (err) {
            next(err);
        }
    }
    // PUT /:id/security-override — Security approves/rejects if resident hasn't acted yet
    async securityOverrideStatus(req, res, next) {
        try {
            const { status } = req.body;
            if (!['approved', 'rejected'].includes(status)) {
                res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
                return;
            }
            const log = await models_1.VisitorLog.findByPk(req.params.id, {
                include: [{ model: models_1.Visitor, as: 'visitor' }],
            });
            if (!log) {
                (0, response_1.sendNotFound)(res, 'Visitor log not found');
                return;
            }
            if (log.status !== 'pending') {
                res.status(400).json({
                    success: false,
                    message: `Cannot override — resident has already ${log.status} this visitor`,
                });
                return;
            }
            await log.update({ status });
            const visitor = log.visitor;
            socket_service_1.default.emitToSocietySecurity(log.society_id, 'visitor_status_update', {
                log_id: log.id,
                visitor_id: log.visitor_id,
                name: visitor?.name,
                status: log.status,
                flat_id: log.flat_id,
                society_id: log.society_id,
            });
            (0, response_1.sendSuccess)(res, `Visitor ${status} by security`, log);
        }
        catch (err) {
            next(err);
        }
    }
    // PUT /:id/checkout — Security marks visitor as checked out
    async checkout(req, res, next) {
        try {
            const log = await models_1.VisitorLog.findByPk(req.params.id, {
                include: [{ model: models_1.Visitor, as: 'visitor' }],
            });
            if (!log) {
                (0, response_1.sendNotFound)(res, 'Visitor log not found');
                return;
            }
            if (log.status === 'checked_out') {
                res.status(400).json({ success: false, message: 'Visitor already checked out' });
                return;
            }
            await log.update({ status: 'checked_out', out_time: new Date() });
            socket_service_1.default.emitToSocietySecurity(log.society_id, 'visitor_status_update', {
                log_id: log.id,
                visitor_id: log.visitor_id,
                name: log.visitor?.name,
                status: log.status,
                flat_id: log.flat_id,
                in_time: log.in_time,
                out_time: log.out_time,
            });
            (0, response_1.sendSuccess)(res, 'Visitor checked out', log);
        }
        catch (err) {
            next(err);
        }
    }
    // GET /lookup/:phone — Auto-fill for repeat visitors (returns profile)
    async getByPhone(req, res, next) {
        try {
            const { phone } = req.params;
            const sid = queryId(req);
            const visitor = await models_1.Visitor.findOne({
                where: sid ? { phone, society_id: sid } : { phone },
                attributes: ['id', 'name', 'phone', 'image', 'vehicle_number'],
            });
            (0, response_1.sendSuccess)(res, visitor ? 'Visitor found' : 'New visitor', visitor);
        }
        catch (err) {
            next(err);
        }
    }
    // GET / — List all visitor logs (filtered by role, supports search by name/phone)
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { visitor_type, status, flat_id, date, start_date, end_date, search } = req.query;
            const where = {};
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            if (req.user.role === 'user') {
                where.flat_id = req.user.dbUser?.flat_id;
            }
            else if (flat_id) {
                where.flat_id = flat_id;
            }
            if (visitor_type)
                where.visitor_type = visitor_type;
            if (status)
                where.status = status;
            if (date) {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(date);
                end.setHours(23, 59, 59, 999);
                where.in_time = { [sequelize_1.Op.between]: [start, end] };
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
            const visitorWhere = {};
            if (search) {
                visitorWhere[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.like]: `%${search}%` } },
                    { phone: { [sequelize_1.Op.like]: `%${search}%` } },
                ];
            }
            const { count, rows } = await models_1.VisitorLog.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.Visitor, as: 'visitor',
                        attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
                        where: Object.keys(visitorWhere).length ? visitorWhere : undefined,
                        required: Object.keys(visitorWhere).length > 0,
                    },
                    { model: models_1.Flat, as: 'flat' },
                    { model: models_1.User, as: 'host', attributes: ['id', 'name'] },
                    { model: models_1.Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['in_time', 'DESC']],
                distinct: true,
            });
            (0, response_1.sendSuccess)(res, 'Visitor logs fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    // GET /:id/logs — All visit logs for a specific visitor profile
    async getVisitorLogs(req, res, next) {
        try {
            const visitorId = parseInt(req.params.id, 10);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const visitor = await models_1.Visitor.findByPk(visitorId, {
                attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
            });
            if (!visitor) {
                (0, response_1.sendNotFound)(res, 'Visitor not found');
                return;
            }
            const where = { visitor_id: visitorId };
            const sid = queryId(req);
            if (sid)
                where.society_id = sid;
            const { count, rows } = await models_1.VisitorLog.findAndCountAll({
                where,
                include: [
                    { model: models_1.Flat, as: 'flat', attributes: ['id', 'flat_number'] },
                    { model: models_1.User, as: 'host', attributes: ['id', 'name'] },
                    { model: models_1.Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['in_time', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Visitor logs fetched', { visitor, logs: rows }, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    // GET /pending-requests — Returns pending visitor requests created in the last 30 seconds for the user's flat
    async getRecentPendingRequests(req, res, next) {
        try {
            const seconds = parseInt(req.query.seconds) || 30;
            const since = new Date(Date.now() - seconds * 1000);
            const where = {
                status: 'pending',
                createdAt: { [sequelize_1.Op.gte]: since },
            };
            // Scope to user's flat & society
            if (req.user.role === 'user') {
                where.flat_id = req.user.dbUser?.flat_id;
                where.society_id = req.user.society_id;
            }
            else {
                const sid = queryId(req);
                if (sid)
                    where.society_id = sid;
                if (req.query.flat_id)
                    where.flat_id = req.query.flat_id;
            }
            const requests = await models_1.VisitorLog.findAll({
                where,
                include: [
                    {
                        model: models_1.Visitor,
                        as: 'visitor',
                        attributes: ['id', 'uuid', 'name', 'phone', 'image', 'vehicle_number'],
                    },
                    { model: models_1.Flat, as: 'flat', attributes: ['id', 'flat_number'] },
                    { model: models_1.Staff, as: 'createdByStaff', attributes: ['id', 'name'] },
                ],
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Pending requests fetched', {
                has_pending: requests.length > 0,
                count: requests.length,
                requests,
                checked_window_seconds: seconds,
            });
        }
        catch (err) {
            next(err);
        }
    }
    // POST /pre-approve — User pre-approves an upcoming visitor
    async preApprove(req, res, next) {
        try {
            const { name, phone, visitor_type, vehicle_number, pre_approved_date, purpose } = req.body;
            const societyId = bodyId(req);
            const [visitor] = await models_1.Visitor.findOrCreate({
                where: { phone, society_id: societyId },
                defaults: { name, phone, vehicle_number: vehicle_number || null, society_id: societyId },
            });
            const log = await models_1.VisitorLog.create({
                visitor_id: visitor.id,
                visitor_type: visitor_type || 'guest',
                flat_id: req.user.dbUser?.flat_id,
                society_id: societyId,
                host_user_id: req.user.id,
                status: 'approved',
                is_pre_approved: true,
                pre_approved_date: pre_approved_date || null,
                purpose: purpose || null,
                in_time: pre_approved_date ? new Date(pre_approved_date) : new Date(),
            });
            (0, response_1.sendCreated)(res, 'Visitor pre-approved', { visitor, log });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VisitorController = VisitorController;
exports.default = new VisitorController();
//# sourceMappingURL=visitor.controller.js.map
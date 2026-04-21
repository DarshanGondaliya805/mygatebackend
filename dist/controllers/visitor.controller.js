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
class VisitorController {
    // Security: create visitor entry
    async create(req, res, next) {
        try {
            const { name, phone, visitor_type, vehicle_number, flat_id, purpose, is_pre_approved, } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            // Check if visitor has visited before (by phone)
            const existing = await models_1.Visitor.findOne({
                where: { phone, society_id: req.user.society_id },
                order: [['createdAt', 'DESC']],
            });
            // Get flat's resident(s) to notify
            const residents = await models_1.User.findAll({
                where: { flat_id, is_active: true, is_approved: true, role: 'user' },
                attributes: ['id'],
            });
            const visitor = await models_1.Visitor.create({
                name: existing ? existing.name : name,
                phone,
                image,
                visitor_type,
                vehicle_number: vehicle_number || null,
                flat_id,
                society_id: req.user.society_id,
                created_by: req.user.id,
                status: is_pre_approved ? 'approved' : 'pending',
                purpose: purpose || null,
                in_time: new Date(),
                is_pre_approved: !!is_pre_approved,
            });
            // Notify residents if not pre-approved
            if (!is_pre_approved && residents.length > 0) {
                await notification_service_1.default.sendToMany(residents.map((r) => r.id), {
                    title: 'Visitor at Gate',
                    body: `${visitor.name} (${visitor_type}) is at the gate. Allow entry?`,
                    type: 'visitor_request',
                    reference_id: visitor.id,
                    reference_type: 'visitor',
                });
            }
            (0, response_1.sendCreated)(res, 'Visitor entry created', visitor);
        }
        catch (err) {
            next(err);
        }
    }
    // User: approve or reject visitor
    async updateStatus(req, res, next) {
        try {
            const { status } = req.body; // 'approved' | 'rejected'
            const visitor = await models_1.Visitor.findByPk(req.params.id);
            if (!visitor) {
                (0, response_1.sendNotFound)(res, 'Visitor not found');
                return;
            }
            await visitor.update({
                status,
                host_user_id: req.user.id,
                ...(status === 'checked_out' ? { out_time: new Date() } : {}),
            });
            // Notify security
            if (visitor.created_by) {
                await notification_service_1.default.send({
                    user_id: visitor.created_by,
                    title: `Visitor ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                    body: `${visitor.name}'s entry has been ${status} by the resident.`,
                    type: status === 'approved' ? 'visitor_approved' : 'visitor_rejected',
                    reference_id: visitor.id,
                    reference_type: 'visitor',
                });
            }
            (0, response_1.sendSuccess)(res, `Visitor ${status} successfully`, visitor);
        }
        catch (err) {
            next(err);
        }
    }
    // Security: mark visitor checkout
    async checkout(req, res, next) {
        try {
            const visitor = await models_1.Visitor.findByPk(req.params.id);
            if (!visitor) {
                (0, response_1.sendNotFound)(res, 'Visitor not found');
                return;
            }
            await visitor.update({ status: 'checked_out', out_time: new Date() });
            (0, response_1.sendSuccess)(res, 'Visitor checked out', visitor);
        }
        catch (err) {
            next(err);
        }
    }
    // Get visitor by phone (auto-fill for repeat visitors)
    async getByPhone(req, res, next) {
        try {
            const { phone } = req.params;
            const visitor = await models_1.Visitor.findOne({
                where: { phone, society_id: req.user.society_id },
                order: [['createdAt', 'DESC']],
                attributes: ['name', 'phone', 'image', 'vehicle_number'],
            });
            (0, response_1.sendSuccess)(res, visitor ? 'Visitor found' : 'New visitor', visitor);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { visitor_type, status, flat_id, date } = req.query;
            const where = { society_id: req.user.society_id };
            // Regular users only see their flat's visitors
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
                const end = new Date(date);
                end.setDate(end.getDate() + 1);
                where.in_time = { [sequelize_1.Op.between]: [start, end] };
            }
            const { count, rows } = await models_1.Visitor.findAndCountAll({
                where,
                include: [
                    { model: models_1.Flat, as: 'flat' },
                    { model: models_1.User, as: 'host', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['in_time', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Visitors fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    // User: pre-approve visitor
    async preApprove(req, res, next) {
        try {
            const { name, phone, visitor_type, vehicle_number, pre_approved_date, purpose } = req.body;
            const visitor = await models_1.Visitor.create({
                name, phone, visitor_type,
                vehicle_number: vehicle_number || null,
                flat_id: req.user.dbUser?.flat_id,
                society_id: req.user.society_id,
                host_user_id: req.user.id,
                status: 'approved',
                is_pre_approved: true,
                pre_approved_date: pre_approved_date || null,
                purpose: purpose || null,
            });
            (0, response_1.sendCreated)(res, 'Visitor pre-approved', visitor);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VisitorController = VisitorController;
exports.default = new VisitorController();
//# sourceMappingURL=visitor.controller.js.map
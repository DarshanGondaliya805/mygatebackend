"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const upload_1 = require("../utils/upload");
const notification_service_1 = __importDefault(require("../services/notification.service"));
class ComplaintController {
    async create(req, res, next) {
        try {
            const { title, description, category, priority } = req.body;
            const images = req.files
                ? req.files.map((f) => (0, upload_1.getRelativePath)(f.path))
                : null;
            const complaint = await models_1.Complaint.create({
                title, description, category,
                priority: priority || 'medium',
                images,
                raised_by: req.user.id,
                flat_id: req.user.dbUser?.flat_id || null,
                society_id: req.user.society_id,
            });
            // Notify society admins
            const admins = await models_1.User.findAll({
                where: { society_id: req.user.society_id, role: ['admin', 'super_admin'], is_active: true },
                attributes: ['id'],
            });
            await notification_service_1.default.sendToMany(admins.map((a) => a.id), {
                title: 'New Complaint',
                body: `${title} — ${category}`,
                type: 'complaint_update',
                reference_id: complaint.id,
                reference_type: 'complaint',
            });
            (0, response_1.sendCreated)(res, 'Complaint submitted', complaint);
        }
        catch (err) {
            next(err);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const complaint = await models_1.Complaint.findByPk(req.params.id);
            if (!complaint) {
                (0, response_1.sendNotFound)(res, 'Complaint not found');
                return;
            }
            const { status, admin_note, assigned_to } = req.body;
            await complaint.update({
                status,
                admin_note: admin_note || complaint.admin_note,
                assigned_to: assigned_to || complaint.assigned_to,
                ...(status === 'resolved' ? { resolved_at: new Date() } : {}),
            });
            // Notify the user who raised it
            await notification_service_1.default.send({
                user_id: complaint.raised_by,
                title: 'Complaint Status Updated',
                body: `Your complaint "${complaint.title}" is now ${status}.${admin_note ? ` Note: ${admin_note}` : ''}`,
                type: 'complaint_update',
                reference_id: complaint.id,
                reference_type: 'complaint',
            });
            (0, response_1.sendSuccess)(res, 'Complaint updated', complaint);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { status, category } = req.query;
            const where = { society_id: req.user.society_id };
            // Regular users see only their own complaints
            if (req.user.role === 'user') {
                where.raised_by = req.user.id;
            }
            if (status)
                where.status = status;
            if (category)
                where.category = category;
            const { count, rows } = await models_1.Complaint.findAndCountAll({
                where,
                include: [
                    { model: models_1.User, as: 'raisedBy', attributes: ['id', 'name', 'flat_id'] },
                    { model: models_1.User, as: 'assignedTo', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Complaints fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        try {
            const complaint = await models_1.Complaint.findByPk(req.params.id, {
                include: [
                    { model: models_1.User, as: 'raisedBy', attributes: ['id', 'name'] },
                    { model: models_1.User, as: 'assignedTo', attributes: ['id', 'name'] },
                ],
            });
            if (!complaint) {
                (0, response_1.sendNotFound)(res, 'Complaint not found');
                return;
            }
            (0, response_1.sendSuccess)(res, 'Complaint fetched', complaint);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ComplaintController = ComplaintController;
exports.default = new ComplaintController();
//# sourceMappingURL=complaint.controller.js.map
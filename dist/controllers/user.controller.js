"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const upload_1 = require("../utils/upload");
const notification_service_1 = __importDefault(require("../services/notification.service"));
class UserController {
    // Super Admin / Admin: create user
    async create(req, res, next) {
        try {
            const { name, email, phone, password, gender, dob, role, user_type, flat_id, society_id, } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            // Admin can only create users within their own society
            const targetSocietyId = req.user.role === 'super_admin' ? society_id : req.user.society_id;
            const salt = await bcryptjs_1.default.genSalt(12);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Super admin / admin created users are auto-approved
            const user = await models_1.User.create({
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
                await models_1.Flat.update({ is_occupied: true }, { where: { id: flat_id } });
            }
            const { password: _, ...userWithoutPassword } = user.dataValues;
            (0, response_1.sendCreated)(res, 'User created successfully', userWithoutPassword);
        }
        catch (err) {
            next(err);
        }
    }
    // Self-registration — goes for approval
    async register(req, res, next) {
        try {
            const { name, email, phone, password, gender, dob, user_type, flat_id, society_id } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            const salt = await bcryptjs_1.default.genSalt(12);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const user = await models_1.User.create({
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
            const admins = await models_1.User.findAll({
                where: { society_id, role: ['admin', 'super_admin'], is_active: true },
                attributes: ['id'],
            });
            await notification_service_1.default.sendToMany(admins.map((a) => a.id), {
                title: 'New User Registration',
                body: `${name} has registered and is waiting for approval.`,
                type: 'approval_request',
                reference_id: user.id,
                reference_type: 'user',
            });
            (0, response_1.sendCreated)(res, 'Registration successful. Waiting for admin approval.');
        }
        catch (err) {
            next(err);
        }
    }
    async getUnapproved(req, res, next) {
        try {
            // Support both GET (query) and POST (body)
            const source = req.method === 'POST' ? req.body : req.query;
            const page = parseInt(source.page) || 1;
            const limit = parseInt(source.limit) || 20;
            const search = source.search;
            const sortBy = source.sort_by || 'createdAt';
            const sortOrder = source.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const allowedSorts = ['name', 'email', 'phone', 'createdAt'];
            const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
            const where = { is_approved: false, is_active: true };
            if (req.user.role !== 'super_admin') {
                where.society_id = req.user.society_id;
            }
            else if (source.society_id) {
                where.society_id = source.society_id;
            }
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.like]: `%${search}%` } },
                    { email: { [sequelize_1.Op.like]: `%${search}%` } },
                    { phone: { [sequelize_1.Op.like]: `%${search}%` } },
                ];
            }
            const { count, rows } = await models_1.User.findAndCountAll({
                where,
                include: [
                    { model: models_1.Flat, as: 'flat' },
                    { model: models_1.Society, as: 'society', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [[orderField, sortOrder]],
            });
            (0, response_1.sendSuccess)(res, 'Unapproved users fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async approve(req, res, next) {
        try {
            const user = await models_1.User.findByPk(req.params.id);
            if (!user) {
                (0, response_1.sendNotFound)(res, 'User not found');
                return;
            }
            await user.update({ is_approved: true });
            await notification_service_1.default.send({
                user_id: user.id,
                title: 'Account Approved',
                body: 'Your account has been approved. You can now log in.',
                type: 'approval_request',
            });
            (0, response_1.sendSuccess)(res, 'User approved successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { role, is_approved, search } = req.query;
            const where = {};
            // Admins only see their society's users
            if (req.user.role !== 'super_admin') {
                where.society_id = req.user.society_id;
            }
            else if (req.query.society_id) {
                where.society_id = req.query.society_id;
            }
            if (role)
                where.role = role;
            if (is_approved !== undefined)
                where.is_approved = is_approved === 'true';
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.like]: `%${search}%` } },
                    { phone: { [sequelize_1.Op.like]: `%${search}%` } },
                    { email: { [sequelize_1.Op.like]: `%${search}%` } },
                ];
            }
            const { count, rows } = await models_1.User.findAndCountAll({
                where,
                include: [
                    { model: models_1.Flat, as: 'flat' },
                    { model: models_1.Society, as: 'society', attributes: ['id', 'name'] },
                ],
                ...(0, response_1.getPagination)(page, limit),
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Users fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        try {
            const user = await models_1.User.findByPk(req.params.id, {
                include: [
                    { model: models_1.Flat, as: 'flat' },
                    { model: models_1.Society, as: 'society', attributes: ['id', 'name'] },
                ],
            });
            if (!user) {
                (0, response_1.sendNotFound)(res, 'User not found');
                return;
            }
            (0, response_1.sendSuccess)(res, 'User fetched', user);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const user = await models_1.User.findByPk(req.params.id);
            if (!user) {
                (0, response_1.sendNotFound)(res, 'User not found');
                return;
            }
            const { name, email, gender, dob, user_type, flat_id, is_active, fcm_token } = req.body;
            const image = req.file ? (0, upload_1.getRelativePath)(req.file.path) : undefined;
            await user.update({
                name, email, gender, dob, user_type,
                flat_id: flat_id !== undefined ? flat_id : user.flat_id,
                ...(is_active !== undefined ? { is_active } : {}),
                ...(fcm_token ? { fcm_token } : {}),
                ...(image ? { image } : {}),
            });
            (0, response_1.sendSuccess)(res, 'User updated', user);
        }
        catch (err) {
            next(err);
        }
    }
    async toggleActive(req, res, next) {
        try {
            const user = await models_1.User.findByPk(req.params.id);
            if (!user) {
                (0, response_1.sendNotFound)(res, 'User not found');
                return;
            }
            if (!['admin', 'super_admin'].includes(user.role)) {
                (0, response_1.sendError)(res, 'Only admin accounts can be toggled here', 400);
                return;
            }
            await user.update({ is_active: !user.is_active });
            (0, response_1.sendSuccess)(res, `Admin ${user.is_active ? 'activated' : 'deactivated'} successfully`, { id: user.id, is_active: user.is_active });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const user = await models_1.User.findByPk(req.params.id);
            if (!user) {
                (0, response_1.sendNotFound)(res, 'User not found');
                return;
            }
            await user.destroy();
            (0, response_1.sendSuccess)(res, 'User deleted');
        }
        catch (err) {
            next(err);
        }
    }
    // Get flat-mates / building directory
    async getBuildingDirectory(req, res, next) {
        try {
            const societyId = req.user.society_id;
            const users = await models_1.User.findAll({
                where: {
                    society_id: societyId,
                    role: 'user',
                    is_approved: true,
                    is_active: true,
                },
                include: [{ model: models_1.Flat, as: 'flat', attributes: ['id', 'flat_number', 'floor'] }],
                attributes: ['id', 'name', 'phone', 'image', 'flat_id'],
                order: [['name', 'ASC']],
            });
            (0, response_1.sendSuccess)(res, 'Building directory fetched', users);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map
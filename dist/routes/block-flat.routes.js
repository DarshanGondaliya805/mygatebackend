"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatRouter = exports.blockRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const models_1 = require("../models");
const response_1 = require("../utils/response");
// ─── Block Routes ─────────────────────────────────────────────────────────────
exports.blockRouter = (0, express_1.Router)();
exports.blockRouter.get('/society/:societyId', async (req, res, next) => {
    try {
        const blocks = await models_1.Block.findAll({
            where: { society_id: req.params.societyId },
            include: [{ model: models_1.Flat, as: 'flats' }],
            order: [['name', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Blocks fetched', blocks);
    }
    catch (err) {
        next(err);
    }
});
exports.blockRouter.use(auth_middleware_1.authenticate);
exports.blockRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), async (req, res, next) => {
    try {
        const { name, society_id, total_floors, flats } = req.body;
        const targetSociety = req.user.role === 'super_admin' ? society_id : req.user.society_id;
        // Hard-delete any soft-deleted block with the same name so the unique constraint doesn't fire
        const existing = await models_1.Block.findOne({ where: { name, society_id: targetSociety }, paranoid: false });
        if (existing) {
            if (!existing.deletedAt) {
                (0, response_1.sendError)(res, 'A block with this name already exists', 409);
                return;
            }
            await existing.destroy({ force: true });
        }
        const block = await models_1.Block.create({ name, society_id: targetSociety, total_floors, total_flats: flats?.length || 0 });
        if (flats && Array.isArray(flats)) {
            await models_1.Flat.bulkCreate(flats.map((f) => ({
                flat_number: f.flat_number,
                floor: f.floor,
                type: f.type,
                block_id: block.id,
                society_id: targetSociety,
            })));
        }
        const created = await models_1.Block.findByPk(block.id, { include: [{ model: models_1.Flat, as: 'flats' }] });
        (0, response_1.sendCreated)(res, 'Block created', created);
    }
    catch (err) {
        next(err);
    }
});
exports.blockRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), async (req, res, next) => {
    try {
        const block = await models_1.Block.findByPk(req.params.id);
        if (!block) {
            (0, response_1.sendNotFound)(res, 'Block not found');
            return;
        }
        await block.destroy();
        (0, response_1.sendSuccess)(res, 'Block deleted');
    }
    catch (err) {
        next(err);
    }
});
// ─── Flat Routes ──────────────────────────────────────────────────────────────
exports.flatRouter = (0, express_1.Router)();
exports.flatRouter.get('/block/:blockId', async (req, res, next) => {
    try {
        const flats = await models_1.Flat.findAll({
            where: { block_id: req.params.blockId },
            order: [['flat_number', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Flats fetched', flats);
    }
    catch (err) {
        next(err);
    }
});
exports.flatRouter.use(auth_middleware_1.authenticate);
exports.flatRouter.post('/', (0, auth_middleware_1.authorize)('super_admin', 'admin'), async (req, res, next) => {
    try {
        const { flat_number, floor, block_id, society_id, type } = req.body;
        const flat = await models_1.Flat.create({ flat_number, floor, block_id, society_id, type });
        (0, response_1.sendCreated)(res, 'Flat created', flat);
    }
    catch (err) {
        next(err);
    }
});
exports.flatRouter.get('/society/:societyId', async (req, res, next) => {
    try {
        const flats = await models_1.Flat.findAll({
            where: { society_id: req.params.societyId },
            include: [{ model: models_1.Block, as: 'block' }],
            order: [['flat_number', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Flats fetched', flats);
    }
    catch (err) {
        next(err);
    }
});
exports.flatRouter.delete('/:id', (0, auth_middleware_1.authorize)('super_admin', 'admin'), async (req, res, next) => {
    try {
        const flat = await models_1.Flat.findByPk(req.params.id);
        if (!flat) {
            (0, response_1.sendNotFound)(res, 'Flat not found');
            return;
        }
        await flat.destroy();
        (0, response_1.sendSuccess)(res, 'Flat deleted');
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=block-flat.routes.js.map
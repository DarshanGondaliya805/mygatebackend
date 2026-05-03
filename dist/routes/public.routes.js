"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// GET /public/societies — all active societies (no auth)
router.get('/societies', async (req, res, next) => {
    try {
        const societies = await models_1.Society.findAll({
            where: { is_active: true },
            attributes: ['id', 'name', 'location', 'city', 'state', 'pincode', 'logo', 'total_blocks'],
            order: [['name', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Societies fetched', societies);
    }
    catch (err) {
        next(err);
    }
});
// GET /public/societies/:societyId/blocks — all blocks in a society (no auth)
router.get('/societies/:societyId/blocks', async (req, res, next) => {
    try {
        const society = await models_1.Society.findByPk(req.params.societyId, { attributes: ['id'] });
        if (!society) {
            (0, response_1.sendNotFound)(res, 'Society not found');
            return;
        }
        const blocks = await models_1.Block.findAll({
            where: { society_id: req.params.societyId },
            attributes: ['id', 'name', 'total_floors', 'total_flats'],
            order: [['name', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Blocks fetched', blocks);
    }
    catch (err) {
        next(err);
    }
});
// GET /public/blocks/:blockId/flats — all flats in a block (no auth)
router.get('/blocks/:blockId/flats', async (req, res, next) => {
    try {
        const block = await models_1.Block.findByPk(req.params.blockId, { attributes: ['id'] });
        if (!block) {
            (0, response_1.sendNotFound)(res, 'Block not found');
            return;
        }
        const flats = await models_1.Flat.findAll({
            where: { block_id: req.params.blockId },
            attributes: ['id', 'flat_number', 'floor', 'type', 'is_occupied'],
            order: [['floor', 'ASC'], ['flat_number', 'ASC']],
        });
        (0, response_1.sendSuccess)(res, 'Flats fetched', flats);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=public.routes.js.map
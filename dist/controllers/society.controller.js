"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocietyController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const upload_1 = require("../utils/upload");
class SocietyController {
    // Super Admin: create society with blocks and flats
    async create(req, res, next) {
        try {
            const { name, location, city, state, pincode } = req.body;
            const logo = req.file ? (0, upload_1.getRelativePath)(req.file.path) : null;
            // multipart/form-data sends JSON arrays as strings — parse if needed
            let blockData = req.body.blocks;
            if (typeof blockData === 'string') {
                try {
                    blockData = JSON.parse(blockData);
                }
                catch {
                    blockData = undefined;
                }
            }
            const society = await models_1.Society.create({
                name,
                location,
                city,
                state,
                pincode,
                logo,
                total_blocks: blockData?.length || 0,
                created_by: req.user.id,
            });
            // Create blocks and flats if provided
            if (blockData && Array.isArray(blockData)) {
                for (const b of blockData) {
                    const block = await models_1.Block.create({
                        name: b.name,
                        society_id: society.id,
                        total_floors: b.total_floors,
                        total_flats: b.flats?.length || 0,
                    });
                    if (b.flats && Array.isArray(b.flats)) {
                        const flatRecords = b.flats.map((f) => ({
                            flat_number: f.flat_number,
                            floor: f.floor,
                            type: f.type,
                            block_id: block.id,
                            society_id: society.id,
                        }));
                        await models_1.Flat.bulkCreate(flatRecords);
                    }
                }
            }
            const created = await models_1.Society.findByPk(society.id, {
                include: [{ model: models_1.Block, as: 'blocks', include: [{ model: models_1.Flat, as: 'flats' }] }],
            });
            (0, response_1.sendCreated)(res, 'Society created successfully', created);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const where = {};
            if (search)
                where.name = { [sequelize_1.Op.like]: `%${search}%` };
            const { count, rows } = await models_1.Society.findAndCountAll({
                where,
                ...(0, response_1.getPagination)(page, limit),
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.sendSuccess)(res, 'Societies fetched', rows, 200, (0, response_1.getPaginationMeta)(count, page, limit));
        }
        catch (err) {
            next(err);
        }
    }
    async getOne(req, res, next) {
        try {
            const society = await models_1.Society.findByPk(req.params.id, {
                include: [
                    {
                        model: models_1.Block,
                        as: 'blocks',
                        include: [{ model: models_1.Flat, as: 'flats' }],
                    },
                ],
            });
            if (!society) {
                (0, response_1.sendNotFound)(res, 'Society not found');
                return;
            }
            (0, response_1.sendSuccess)(res, 'Society fetched', society);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const society = await models_1.Society.findByPk(req.params.id);
            if (!society) {
                (0, response_1.sendNotFound)(res, 'Society not found');
                return;
            }
            const { name, location, city, state, pincode } = req.body;
            const logo = req.file ? (0, upload_1.getRelativePath)(req.file.path) : undefined;
            await society.update({ name, location, city, state, pincode, ...(logo ? { logo } : {}) });
            (0, response_1.sendSuccess)(res, 'Society updated', society);
        }
        catch (err) {
            next(err);
        }
    }
    async toggleActive(req, res, next) {
        try {
            const society = await models_1.Society.findByPk(req.params.id);
            if (!society) {
                (0, response_1.sendNotFound)(res, 'Society not found');
                return;
            }
            await society.update({ is_active: !society.is_active });
            (0, response_1.sendSuccess)(res, `Society ${society.is_active ? 'activated' : 'deactivated'} successfully`, { id: society.id, is_active: society.is_active });
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            const society = await models_1.Society.findByPk(req.params.id);
            if (!society) {
                (0, response_1.sendNotFound)(res, 'Society not found');
                return;
            }
            await society.destroy();
            (0, response_1.sendSuccess)(res, 'Society deleted');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SocietyController = SocietyController;
exports.default = new SocietyController();
//# sourceMappingURL=society.controller.js.map
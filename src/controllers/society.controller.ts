import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Society, Block, Flat } from '../models';
import { sendSuccess, sendCreated, sendNotFound, sendError, getPagination, getPaginationMeta } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import { getRelativePath } from '../utils/upload';

export class SocietyController {
  // Super Admin: create society with blocks and flats
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, location, city, state, pincode } = req.body;
      const logo = req.file ? getRelativePath(req.file.path) : null;
      // multipart/form-data sends JSON arrays as strings — parse if needed
      let blockData = req.body.blocks;
      if (typeof blockData === 'string') {
        try { blockData = JSON.parse(blockData); } catch { blockData = undefined; }
      }

      const society = await Society.create({
        name,
        location,
        city,
        state,
        pincode,
        logo,
        total_blocks: blockData?.length || 0,
        created_by: req.user!.id,
      });

      // Create blocks and flats if provided
      if (blockData && Array.isArray(blockData)) {
        for (const b of blockData) {
          const block = await Block.create({
            name: b.name,
            society_id: society.id,
            total_floors: b.total_floors,
            total_flats: b.flats?.length || 0,
          });

          if (b.flats && Array.isArray(b.flats)) {
            const flatRecords = b.flats.map((f: any) => ({
              flat_number: f.flat_number,
              floor: f.floor,
              type: f.type,
              block_id: block.id,
              society_id: society.id,
            }));
            await Flat.bulkCreate(flatRecords);
          }
        }
      }

      const created = await Society.findByPk(society.id, {
        include: [{ model: Block, as: 'blocks', include: [{ model: Flat, as: 'flats' }] }],
      });

      sendCreated(res, 'Society created successfully', created);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const where: any = {};
      if (search) where.name = { [Op.like]: `%${search}%` };

      const { count, rows } = await Society.findAndCountAll({
        where,
        ...getPagination(page, limit),
        order: [['createdAt', 'DESC']],
      });

      sendSuccess(res, 'Societies fetched', rows, 200, getPaginationMeta(count, page, limit));
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const society = await Society.findByPk(req.params.id, {
        include: [
          {
            model: Block,
            as: 'blocks',
            include: [{ model: Flat, as: 'flats' }],
          },
        ],
      });
      if (!society) { sendNotFound(res, 'Society not found'); return; }
      sendSuccess(res, 'Society fetched', society);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const society = await Society.findByPk(req.params.id);
      if (!society) { sendNotFound(res, 'Society not found'); return; }

      const { name, location, city, state, pincode } = req.body;
      const logo = req.file ? getRelativePath(req.file.path) : undefined;

      await society.update({ name, location, city, state, pincode, ...(logo ? { logo } : {}) });
      sendSuccess(res, 'Society updated', society);
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const society = await Society.findByPk(req.params.id);
      if (!society) { sendNotFound(res, 'Society not found'); return; }

      await society.update({ is_active: !society.is_active });
      sendSuccess(res, `Society ${society.is_active ? 'activated' : 'deactivated'} successfully`, { id: society.id, is_active: society.is_active });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const society = await Society.findByPk(req.params.id);
      if (!society) { sendNotFound(res, 'Society not found'); return; }
      await society.destroy();
      sendSuccess(res, 'Society deleted');
    } catch (err) {
      next(err);
    }
  }
}

export default new SocietyController();

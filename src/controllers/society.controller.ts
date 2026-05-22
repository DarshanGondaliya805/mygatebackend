import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  sequelize,
  Society, Block, Flat, User, Staff,
  SocietyPolicy, Amenity, Visitor, VisitorLog,
  DailyHelper, HelperEntryLog, Complaint, Event,
  ServiceContact, Notification,
} from '../models';
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
    const id = parseInt(req.params.id);
    const t = await sequelize.transaction();
    try {
      const society = await Society.findByPk(id, { transaction: t });
      if (!society) { await t.rollback(); sendNotFound(res, 'Society not found'); return; }

      // ── 1. Collect user IDs — Notification has no society_id ───────────────
      const societyUsers = await User.findAll({
        where: { society_id: id },
        attributes: ['id'],
        transaction: t,
      });
      const userIds = societyUsers.map((u) => u.id);

      // ── 2. Notifications (linked to users only) ─────────────────────────────
      if (userIds.length > 0) {
        await Notification.destroy({ where: { user_id: userIds }, force: true, transaction: t });
      }

      // ── 3. HelperEntryLog (has society_id; child of DailyHelper & Staff) ────
      await HelperEntryLog.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 4. VisitorLog (has society_id; child of Visitor, Flat, User, Staff) ─
      await VisitorLog.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 5. Complaints (has society_id; child of User) ───────────────────────
      await Complaint.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 6. Events (has society_id; child of User) ───────────────────────────
      await Event.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 7. Visitors (has society_id; parent of VisitorLog — already deleted) ─
      await Visitor.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 8. DailyHelpers (has society_id; parent of HelperEntryLog — done) ───
      await DailyHelper.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 9. Service Contacts ──────────────────────────────────────────────────
      await ServiceContact.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 10. Policies ─────────────────────────────────────────────────────────
      await SocietyPolicy.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 11. Amenities ────────────────────────────────────────────────────────
      await Amenity.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 12. Staff (has society_id; FK refs already cleared above) ────────────
      await Staff.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 13. Users (has society_id; FK refs already cleared above) ────────────
      await User.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 14. Flats (has society_id; FK refs cleared — users & visitor logs gone) ─
      await Flat.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 15. Blocks ───────────────────────────────────────────────────────────
      await Block.destroy({ where: { society_id: id }, force: true, transaction: t });

      // ── 16. Society itself ───────────────────────────────────────────────────
      await society.destroy({ force: true, transaction: t });

      await t.commit();
      sendSuccess(res, 'Society and all related data deleted successfully');
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
  async getallSociety(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const societies = await Society.findAll({ where: { is_active: true } });
      sendSuccess(res, 'Active societies fetched', societies);
    } catch (err) {
      next(err);
    }
  }


}



export default new SocietyController();

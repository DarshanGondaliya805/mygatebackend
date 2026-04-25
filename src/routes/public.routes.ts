import { Router, Request, Response, NextFunction } from 'express';
import { Society, Block, Flat } from '../models';
import { sendSuccess, sendNotFound } from '../utils/response';

const router = Router();

// GET /public/societies — all active societies (no auth)
router.get('/societies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const societies = await Society.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'location', 'city', 'state', 'pincode', 'logo', 'total_blocks'],
      order: [['name', 'ASC']],
    });
    sendSuccess(res, 'Societies fetched', societies);
  } catch (err) { next(err); }
});

// GET /public/societies/:societyId/blocks — all blocks in a society (no auth)
router.get('/societies/:societyId/blocks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const society = await Society.findByPk(req.params.societyId, { attributes: ['id'] });
    if (!society) { sendNotFound(res, 'Society not found'); return; }

    const blocks = await Block.findAll({
      where: { society_id: req.params.societyId },
      attributes: ['id', 'name', 'total_floors', 'total_flats'],
      order: [['name', 'ASC']],
    });
    sendSuccess(res, 'Blocks fetched', blocks);
  } catch (err) { next(err); }
});

// GET /public/blocks/:blockId/flats — all flats in a block (no auth)
router.get('/blocks/:blockId/flats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await Block.findByPk(req.params.blockId, { attributes: ['id'] });
    if (!block) { sendNotFound(res, 'Block not found'); return; }

    const flats = await Flat.findAll({
      where: { block_id: req.params.blockId },
      attributes: ['id', 'flat_number', 'floor', 'type', 'is_occupied'],
      order: [['floor', 'ASC'], ['flat_number', 'ASC']],
    });
    sendSuccess(res, 'Flats fetched', flats);
  } catch (err) { next(err); }
});

export default router;

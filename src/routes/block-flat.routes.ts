import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import { Block, Flat } from '../models';
import { sendSuccess, sendCreated, sendNotFound } from '../utils/response';

// ─── Block Routes ─────────────────────────────────────────────────────────────
export const blockRouter = Router();
blockRouter.get('/society/:societyId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const blocks = await Block.findAll({
      where: { society_id: req.params.societyId },
      include: [{ model: Flat, as: 'flats' }],
      order: [['name', 'ASC']],
    });
    sendSuccess(res, 'Blocks fetched', blocks);
  } catch (err) { next(err); }
});
blockRouter.use(authenticate);

blockRouter.post('/', authorize('super_admin', 'admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, society_id, total_floors, flats } = req.body;
    const targetSociety = req.user!.role === 'super_admin' ? society_id : req.user!.society_id;

    const block = await Block.create({ name, society_id: targetSociety, total_floors, total_flats: flats?.length || 0 });

    if (flats && Array.isArray(flats)) {
      await Flat.bulkCreate(flats.map((f: any) => ({
        flat_number: f.flat_number,
        floor: f.floor,
        type: f.type,
        block_id: block.id,
        society_id: targetSociety,
      })));
    }

    const created = await Block.findByPk(block.id, { include: [{ model: Flat, as: 'flats' }] });
    sendCreated(res, 'Block created', created);
  } catch (err) { next(err); }
});



blockRouter.delete('/:id', authorize('super_admin', 'admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const block = await Block.findByPk(req.params.id);
    if (!block) { sendNotFound(res, 'Block not found'); return; }
    await block.destroy();
    sendSuccess(res, 'Block deleted');
  } catch (err) { next(err); }
});

// ─── Flat Routes ──────────────────────────────────────────────────────────────
export const flatRouter = Router();
flatRouter.get('/block/:blockId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flats = await Flat.findAll({
      where: { block_id: req.params.blockId },
      order: [['flat_number', 'ASC']],
    });
    sendSuccess(res, 'Flats fetched', flats);
  } catch (err) { next(err); }
});
flatRouter.use(authenticate);

flatRouter.post('/', authorize('super_admin', 'admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { flat_number, floor, block_id, society_id, type } = req.body;
    const flat = await Flat.create({ flat_number, floor, block_id, society_id, type });
    sendCreated(res, 'Flat created', flat);
  } catch (err) { next(err); }
});



flatRouter.get('/society/:societyId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flats = await Flat.findAll({
      where: { society_id: req.params.societyId },
      include: [{ model: Block, as: 'block' }],
      order: [['flat_number', 'ASC']],
    });
    sendSuccess(res, 'Flats fetched', flats);
  } catch (err) { next(err); }
});

flatRouter.delete('/:id', authorize('super_admin', 'admin'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const flat = await Flat.findByPk(req.params.id);
    if (!flat) { sendNotFound(res, 'Flat not found'); return; }
    await flat.destroy();
    sendSuccess(res, 'Flat deleted');
  } catch (err) { next(err); }
});

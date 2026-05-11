import { Router } from 'express';
import {
  staffController,
  dailyHelperController,
  eventController,
  serviceContactController,
  policyController,
  amenityController,
} from '../controllers/misc.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle, uploadFields } from '../utils/upload';

// ─── Staff Routes ─────────────────────────────────────────────────────────────
export const staffRouter = Router();
staffRouter.use(authenticate);
staffRouter.post(
  '/',
  authorize('super_admin', 'admin'),
  uploadFields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]),
  staffController.create.bind(staffController)
);
staffRouter.get('/', staffController.getAll.bind(staffController));
staffRouter.put('/profile', authorize('security'), staffController.updateProfile.bind(staffController));
staffRouter.get('/:id', staffController.getOne.bind(staffController));
staffRouter.put(
  '/:id',
  authorize('super_admin', 'admin'),
  uploadFields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]),
  staffController.update.bind(staffController)
);
staffRouter.delete('/:id', authorize('super_admin', 'admin'), staffController.delete.bind(staffController));

// ─── Daily Helper Routes ──────────────────────────────────────────────────────
export const helperRouter = Router();
helperRouter.use(authenticate);
helperRouter.post('/', authorize('user', 'admin'), uploadSingle('image'), dailyHelperController.create.bind(dailyHelperController));
helperRouter.get('/my', authorize('user'), dailyHelperController.getMyHelpers.bind(dailyHelperController));
helperRouter.get('/', authorize('admin', 'super_admin', 'security'), dailyHelperController.getAllForSociety.bind(dailyHelperController));
helperRouter.post('/entry', authorize('security', 'admin'), dailyHelperController.logEntry.bind(dailyHelperController));
helperRouter.put('/:helper_id/exit', authorize('security', 'admin'), dailyHelperController.logExit.bind(dailyHelperController));
helperRouter.get('/logs', authorize('security', 'admin', 'super_admin'), dailyHelperController.getLogs.bind(dailyHelperController));

// ─── Event Routes ─────────────────────────────────────────────────────────────
export const eventRouter = Router();
eventRouter.use(authenticate);
eventRouter.post('/', authorize('admin', 'super_admin'), uploadSingle('image'), eventController.create.bind(eventController));
eventRouter.get('/', eventController.getAll.bind(eventController));
eventRouter.put('/:id', authorize('admin', 'super_admin'), uploadSingle('image'), eventController.update.bind(eventController));
eventRouter.delete('/:id', authorize('admin', 'super_admin'), eventController.delete.bind(eventController));

// ─── Service Contact Routes ───────────────────────────────────────────────────
export const serviceRouter = Router();
serviceRouter.use(authenticate);
serviceRouter.post('/', authorize('super_admin', 'admin'), serviceContactController.create.bind(serviceContactController));
serviceRouter.get('/', serviceContactController.getAll.bind(serviceContactController));
serviceRouter.put('/:id', authorize('super_admin', 'admin'), serviceContactController.update.bind(serviceContactController));
serviceRouter.delete('/:id', authorize('super_admin', 'admin'), serviceContactController.delete.bind(serviceContactController));

// ─── Policy Routes ────────────────────────────────────────────────────────────
export const policyRouter = Router();
policyRouter.use(authenticate);
policyRouter.post('/', authorize('super_admin', 'admin'), policyController.create.bind(policyController));
policyRouter.get('/', policyController.getAll.bind(policyController));
policyRouter.put('/:id', authorize('super_admin', 'admin'), policyController.update.bind(policyController));
policyRouter.delete('/:id', authorize('super_admin', 'admin'), policyController.delete.bind(policyController));

// ─── Amenity Routes ───────────────────────────────────────────────────────────
export const amenityRouter = Router();
amenityRouter.use(authenticate);
amenityRouter.post('/', authorize('super_admin', 'admin'), uploadSingle('image'), amenityController.create.bind(amenityController));
amenityRouter.get('/', amenityController.getAll.bind(amenityController));
amenityRouter.put('/:id', authorize('super_admin', 'admin'), uploadSingle('image'), amenityController.update.bind(amenityController));
amenityRouter.delete('/:id', authorize('super_admin', 'admin'), amenityController.delete.bind(amenityController));

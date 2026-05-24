import { Router } from 'express';
import { body } from 'express-validator';
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
import { validate } from '../middlewares/validate.middleware';

const staffValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('staff_type')
    .notEmpty().withMessage('Staff type is required')
    .isIn(['security', 'cleaning', 'gardening', 'maintenance', 'electrician', 'plumber', 'lift_operator', 'other'])
    .withMessage('Invalid staff type'),
  // society_id required for super_admin (admins use their own society automatically)
  body('society_id').custom((value, { req }) => {
    if ((req as any).user?.role === 'super_admin' && !value) {
      throw new Error('Society is required');
    }
    return true;
  }),
];

const staffUpdateValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  // password is optional on update — only validated when provided
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // staff_type is optional on update — only validated when provided
  body('staff_type')
    .optional({ checkFalsy: true })
    .isIn(['security', 'cleaning', 'gardening', 'maintenance', 'electrician', 'plumber', 'lift_operator', 'other'])
    .withMessage('Invalid staff type'),
  // society_id is optional on update — if omitted the staff stays in their current society
];

// ─── Staff Routes ─────────────────────────────────────────────────────────────
export const staffRouter = Router();
staffRouter.use(authenticate);
staffRouter.post(
  '/',
  authorize('super_admin', 'admin'),
  uploadFields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]),
  validate(staffValidation),
  staffController.create.bind(staffController)
);
staffRouter.get('/', staffController.getAll.bind(staffController));
staffRouter.put('/profile', authorize('security'), uploadSingle('image'), staffController.updateProfile.bind(staffController));
staffRouter.get('/:id', staffController.getOne.bind(staffController));
staffRouter.put(
  '/:id',
  authorize('super_admin', 'admin'),
  uploadFields([{ name: 'image', maxCount: 1 }, { name: 'documents', maxCount: 5 }]),
  validate(staffUpdateValidation),
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

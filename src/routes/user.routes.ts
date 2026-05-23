import { Router } from 'express';
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// ── Validation rules ─────────────────────────────────────────────────────────

const createValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // society_id required only when the caller is a super_admin (admins use their own society)
  body('society_id').custom((value, { req }) => {
    if ((req as any).user?.role === 'super_admin' && !value) {
      throw new Error('Society is required');
    }
    return true;
  }),
  // flat_id required when creating a regular user (role defaults to 'user')
  body('flat_id').custom((value, { req }) => {
    const role = (req as any).body?.role;
    const isUserRole = !role || role === 'user';
    if (isUserRole && !value) {
      throw new Error('Flat is required for user role');
    }
    return true;
  }),
];

const updateValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('phone').notEmpty().withMessage('Phone is required'),
  // password is optional on update — only validated when provided
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // society_id required only for super_admin callers
  body('society_id').custom((value, { req }) => {
    if ((req as any).user?.role === 'super_admin' && !value) {
      throw new Error('Society is required');
    }
    return true;
  }),
  // flat_id required when the role being set is 'user'
  body('flat_id').custom((value, { req }) => {
    const role = (req as any).body?.role;
    if (role === 'user' && !value) {
      throw new Error('Flat is required for user role');
    }
    return true;
  }),
];

// ── Routes ───────────────────────────────────────────────────────────────────

// Public: self-registration
router.post('/register', uploadSingle('image'), userController.register.bind(userController));

router.use(authenticate);

// Directory (all authenticated users can see building directory)
router.get('/directory', userController.getBuildingDirectory.bind(userController));

// Admin & Super Admin only
router.post(
  '/',
  authorize('super_admin', 'admin'),
  uploadSingle('image'),
  validate(createValidation),
  userController.create.bind(userController),
);
router.get('/', authorize('super_admin', 'admin'), userController.getAll.bind(userController));
router.get('/unapproved', authorize('super_admin', 'admin'), userController.getUnapproved.bind(userController));
router.post('/unapproved', authorize('super_admin', 'admin'), userController.getUnapproved.bind(userController));
router.put('/:id/approve', authorize('super_admin', 'admin'), userController.approve.bind(userController));
router.put('/:id/toggle-active', authorize('super_admin'), userController.toggleActive.bind(userController));
router.delete('/:id', authorize('super_admin', 'admin'), userController.delete.bind(userController));

// Self or admin
router.get('/:id', userController.getOne.bind(userController));
router.put(
  '/:id',
  uploadSingle('image'),
  validate(updateValidation),
  userController.update.bind(userController),
);

export default router;

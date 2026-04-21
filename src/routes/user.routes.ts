import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';

const router = Router();

// Public: self-registration
router.post('/register', uploadSingle('image'), userController.register.bind(userController));

router.use(authenticate);

// Directory (all authenticated users can see building directory)
router.get('/directory', userController.getBuildingDirectory.bind(userController));

// Admin & Super Admin only
router.post('/', authorize('super_admin', 'admin'), uploadSingle('image'), userController.create.bind(userController));
router.get('/', authorize('super_admin', 'admin'), userController.getAll.bind(userController));
router.get('/unapproved', authorize('super_admin', 'admin'), userController.getUnapproved.bind(userController));
router.post('/unapproved', authorize('super_admin', 'admin'), userController.getUnapproved.bind(userController));
router.put('/:id/approve', authorize('super_admin', 'admin'), userController.approve.bind(userController));
router.put('/:id/toggle-active', authorize('super_admin'), userController.toggleActive.bind(userController));
router.delete('/:id', authorize('super_admin', 'admin'), userController.delete.bind(userController));

// Self or admin
router.get('/:id', userController.getOne.bind(userController));
router.put('/:id', uploadSingle('image'), userController.update.bind(userController));

export default router;

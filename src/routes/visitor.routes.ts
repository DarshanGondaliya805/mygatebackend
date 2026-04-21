import { Router } from 'express';
import visitorController from '../controllers/visitor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';

const router = Router();
router.use(authenticate);

// Security creates entries
router.post('/', authorize('security', 'admin', 'super_admin'), uploadSingle('image'), visitorController.create.bind(visitorController));

// User pre-approves
router.post('/pre-approve', authorize('user', 'admin'), visitorController.preApprove.bind(visitorController));

// Look up repeat visitor by phone
router.get('/lookup/:phone', authorize('security', 'admin', 'super_admin'), visitorController.getByPhone.bind(visitorController));

// List (filtered by role in controller)
router.get('/', visitorController.getAll.bind(visitorController));

// User approves/rejects
router.put('/:id/status', authorize('user', 'admin'), visitorController.updateStatus.bind(visitorController));

// Security marks checkout
router.put('/:id/checkout', authorize('security', 'admin', 'super_admin'), visitorController.checkout.bind(visitorController));

export default router;

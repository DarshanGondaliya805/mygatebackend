import { Router } from 'express';
import { body } from 'express-validator';
import visitorController from '../controllers/visitor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
router.use(authenticate);

// Security creates entries
router.post('/', 
  authorize('security', 'admin', 'super_admin'), 
  uploadSingle('image'),
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('flat_id').notEmpty().withMessage('Flat ID is required').isInt().withMessage('Flat ID must be a valid integer'),
    body('visitor_type').isIn(['guest', 'delivery', 'cab', 'courier', 'maintenance', 'other']).withMessage('Invalid visitor type'),
  ]),
  visitorController.create.bind(visitorController)
);

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

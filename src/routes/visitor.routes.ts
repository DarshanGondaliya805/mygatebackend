import { Router } from 'express';
import { body } from 'express-validator';
import visitorController from '../controllers/visitor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
router.use(authenticate);

// Security: create visitor entry (creates/updates visitor profile + new visit log)
router.post(
  '/',
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

// User: pre-approve upcoming visitor
router.post('/pre-approve', authorize('user', 'admin'), visitorController.preApprove.bind(visitorController));

// Security: scan visitor QR code — returns full visitor data, current log, flat, host, residents
router.get('/scan/:uuid', authorize('security', 'admin', 'super_admin'), visitorController.scanQR.bind(visitorController));

// Look up repeat visitor profile by phone (for auto-fill)
router.get('/lookup/:phone', authorize('security', 'admin', 'super_admin'), visitorController.getByPhone.bind(visitorController));

// User / security: poll for pending requests created in last N seconds (default 30)
router.get('/pending-requests', visitorController.getRecentPendingRequests.bind(visitorController));

// List all visitor logs (filtered by role, supports date / date range / type / status / flat)
router.get('/', visitorController.getAll.bind(visitorController));

// Get all visit logs for a specific visitor profile
router.get('/:id/logs', visitorController.getVisitorLogs.bind(visitorController));

// User: approve / reject a visitor log entry
router.put('/:id/status', authorize('user', 'admin'), visitorController.updateStatus.bind(visitorController));

// Security: approve / reject visitor only if resident hasn't acted yet (status = pending)
router.put('/:id/security-override', authorize('security', 'admin', 'super_admin'), visitorController.securityOverrideStatus.bind(visitorController));

// Security: mark visitor checkout (sets out_time)
router.put('/:id/checkout', authorize('security', 'admin', 'super_admin'), visitorController.checkout.bind(visitorController));

export default router;

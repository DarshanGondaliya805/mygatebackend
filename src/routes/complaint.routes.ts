import { Router } from 'express';
import complaintController from '../controllers/complaint.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadMultiple } from '../utils/upload';

const router = Router();
router.use(authenticate);

router.post('/', authorize('user', 'admin'), uploadMultiple('images', 3), complaintController.create.bind(complaintController));
router.get('/', complaintController.getAll.bind(complaintController));
router.get('/:id', complaintController.getOne.bind(complaintController));
router.put('/:id/status', authorize('admin', 'super_admin'), complaintController.updateStatus.bind(complaintController));

export default router;

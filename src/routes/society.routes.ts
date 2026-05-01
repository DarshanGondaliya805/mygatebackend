import { Router } from 'express';
import societyController from '../controllers/society.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload';

const router = Router();
router.get('/getallsociety', societyController.getallSociety.bind(societyController));

router.use(authenticate);

router.post('/', authorize('super_admin'), uploadSingle('logo'), societyController.create.bind(societyController));
router.get('/', authorize('super_admin', 'admin'), societyController.getAll.bind(societyController));
router.get('/:id', societyController.getOne.bind(societyController));
router.put('/:id', authorize('super_admin', 'admin'), uploadSingle('logo'), societyController.update.bind(societyController));
router.put('/:id/toggle-active', authorize('super_admin'), societyController.toggleActive.bind(societyController));
router.delete('/:id', authorize('super_admin'), societyController.delete.bind(societyController));


export default router;

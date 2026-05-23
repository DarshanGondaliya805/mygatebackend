import { Router } from 'express';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';
import societyRoutes from './society.routes';
import userRoutes from './user.routes';
import visitorRoutes from './visitor.routes';
import complaintRoutes from './complaint.routes';
import notificationRoutes from './notification.routes';
import { blockRouter, flatRouter } from './block-flat.routes';
import {
  staffRouter,
  helperRouter,
  eventRouter,
  serviceRouter,
  policyRouter,
  amenityRouter,
} from './misc.routes';

const router = Router();
  
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/societies', societyRoutes);
router.use('/users', userRoutes);
router.use('/blocks', blockRouter);
router.use('/flats', flatRouter);
router.use('/visitors', visitorRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notifications', notificationRoutes);
router.use('/staff', staffRouter);
router.use('/daily-helpers', helperRouter);
router.use('/events', eventRouter);
router.use('/service-contacts', serviceRouter);
router.use('/policies', policyRouter);
router.use('/amenities', amenityRouter);

export default router;

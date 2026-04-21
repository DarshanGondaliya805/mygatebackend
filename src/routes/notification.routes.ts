import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import notificationService from '../services/notification.service';
import { sendSuccess, sendNotFound } from '../utils/response';

const router = Router();
router.use(authenticate);

// POST /notifications/test — send a test notification to yourself
router.post('/test', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title = 'Test Notification', body = 'If you see this, notifications are working!' } = req.body;
    await notificationService.send({
      user_id: req.user!.id,
      title,
      body,
      type: 'other',
    });
    sendSuccess(res, 'Test notification sent', { user_id: req.user!.id, title, body });
  } catch (err) { next(err); }
});

// GET /notifications?page=1&limit=20&unread=true
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread === 'true';
    const result = await notificationService.getAll(req.user!.id, page, limit, unreadOnly);
    sendSuccess(res, 'Notifications fetched', result.rows, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) { next(err); }
});

// PUT /notifications/read-all — must be before /:id/read to avoid route conflict
router.put('/read-all', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllRead(req.user!.id);
    sendSuccess(res, 'All notifications marked as read');
  } catch (err) { next(err); }
});

// PUT /notifications/:id/read — mark single notification as read
router.put('/:id/read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const found = await notificationService.markOneRead(parseInt(req.params.id), req.user!.id);
    if (!found) { sendNotFound(res, 'Notification not found'); return; }
    sendSuccess(res, 'Notification marked as read');
  } catch (err) { next(err); }
});

export default router;

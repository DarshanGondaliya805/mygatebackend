import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

const loginValidation = [
  body('identifier').notEmpty().withMessage('Phone or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshValidation = [
  body('refresh_token').notEmpty().withMessage('Refresh token is required'),
];

const changePasswordValidation = [
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 8 }).withMessage('Min 8 characters'),
];

const fcmTokenValidation = [
  body('fcm_token').isString().trim().notEmpty().withMessage('fcm_token is required'),
];

// Public routes
router.post('/login', validate(loginValidation), authController.login.bind(authController));
router.post('/refresh', validate(refreshValidation), authController.refreshToken.bind(authController));

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authController.me.bind(authController));
router.delete('/me', authController.deleteMe.bind(authController));
router.put('/change-password', validate(changePasswordValidation), authController.changePassword.bind(authController));
router.post('/fcm-token', validate(fcmTokenValidation), authController.updateFcmToken.bind(authController));

export default router;

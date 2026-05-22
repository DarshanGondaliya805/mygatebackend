import admin from 'firebase-admin';
import logger from '../utils/logger';

if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    // Log a clear warning but do NOT crash — FCM will simply be unavailable
    logger.warn(
      '[Firebase] Missing env vars (FIREBASE_PROJECT_ID / FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL). ' +
      'FCM push notifications will be disabled.'
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      });
      logger.info('[Firebase] Admin SDK initialized successfully.');
    } catch (err: any) {
      // Bad credentials format — warn but don't bring down the server
      logger.error('[Firebase] initializeApp failed:', err.message);
    }
  }
}

export default admin;

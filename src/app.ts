import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import config from './config/app';
import router from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import logger from './utils/logger';

const app = express();

// Trust proxy — required for express-rate-limit to read X-Forwarded-For correctly
app.set('trust proxy', 1);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*', // Configure for production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── Body parsers & utilities ─────────────────────────────────────────────────
// Use text parser for JSON content-type so we can fix Flutter's double-encoded bodies
app.use(express.text({ type: 'application/json', limit: '10mb' }));
app.use((req, _res, next) => {
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // Flutter sometimes sends "{"key":"val"}" — strip outer quotes and retry
      try {
        const stripped = req.body.trim().replace(/^"|"$/g, '');
        req.body = JSON.parse(stripped);
      } catch {
        req.body = {};
      }
    }
  }
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── HTTP logging ─────────────────────────────────────────────────────────────
if (config.env !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ─── Static file serving (uploads) ───────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(config.upload.path)));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MyGate API is working fine',
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/db';
import config from './config/app';
import logger from './utils/logger';
import socketService from './services/socket.service';

const startServer = async () => {
  try {
    await connectDatabase();

    const httpServer = createServer(app);
    socketService.init(httpServer);

    const server = httpServer.listen(config.port, () => {
      logger.info(`🚀 MyGate API running on port ${config.port} [${config.env}]`);
      logger.info(`📦 Health check: http://localhost:${config.port}/health`);
      logger.info(`🔗 API base:     http://localhost:${config.port}/api/v1`);
      logger.info(`⚡ Socket.io:    ws://localhost:${config.port}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

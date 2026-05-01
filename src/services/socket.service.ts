import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/app';
import logger from '../utils/logger';

interface SocketUser {
  id: number;
  role: string;
  society_id: number;
  source: 'user' | 'security';
}

class SocketService {
  private io: SocketIOServer | null = null;

  init(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      transports: ['websocket', 'polling'],
    });

    // JWT auth middleware for socket connections
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as SocketUser;
        socket.data.user = decoded;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user: SocketUser = socket.data.user;
      logger.info(`Socket connected: user ${user.id} (${user.role}) society ${user.society_id}`);

      // Per-user/staff room — source-prefixed to avoid ID collisions across tables
      const privateRoom = user.source === 'security' ? `security_${user.id}` : `user_${user.id}`;
      socket.join(privateRoom);
      // Society-wide room
      socket.join(`society_${user.society_id}`);
      // Role room within society — e.g. society_1_security
      socket.join(`society_${user.society_id}_${user.role}`);

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: user ${user.id}`);
      });
    });

    logger.info('Socket.io initialized');
  }

  /** Emit to a specific resident/user by their DB id */
  emitToUser(userId: number, event: string, data: unknown): void {
    this.io?.to(`user_${userId}`).emit(event, data);
  }

  /** Emit to a specific staff member by their DB id */
  emitToStaff(staffId: number, event: string, data: unknown): void {
    this.io?.to(`security_${staffId}`).emit(event, data);
  }

  /** Emit to all security staff in a society */
  emitToSocietySecurity(societyId: number, event: string, data: unknown): void {
    this.io?.to(`society_${societyId}_security`).emit(event, data);
  }

  /** Emit to all users (residents) in a society */
  emitToSocietyUsers(societyId: number, event: string, data: unknown): void {
    this.io?.to(`society_${societyId}_user`).emit(event, data);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default new SocketService();

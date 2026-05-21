import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/app';
import logger from '../utils/logger';

interface SocketUser {
  id: number;
  role: string;
  society_id: number;
  source: 'user' | 'security' | 'staff'; // staff = security personnel (auth.service uses 'staff')
}

class SocketService {
  private io: SocketIOServer | null = null;

  init(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      transports: ['websocket', 'polling'],
    });

    const SEP = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    // JWT auth middleware for socket connections
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        logger.info(`${SEP} [SOCKET][AUTH] FAILED — no token provided socketId=${socket.id}`);
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as SocketUser;
        socket.data.user = decoded;
        logger.info(`${SEP} [SOCKET][AUTH] OK — id=${decoded.id} role=${decoded.role} source=${decoded.source}`);
        next();
      } catch (err: any) {
        logger.info(`${SEP} [SOCKET][AUTH] FAILED — invalid token error=${err.message}`);
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user: SocketUser = socket.data.user;

      // Per-user/staff room — source-prefixed to avoid ID collisions across tables
      // JWT for security staff uses source:'staff' (auth.service.ts), so check both values
      const privateRoom = (user.source === 'security' || user.source === 'staff')
        ? `security_${user.id}`
        : `user_${user.id}`;

      const societyRoom = `society_${user.society_id}`;
      const roleRoom    = `society_${user.society_id}_${user.role}`;

      socket.join(privateRoom);
      socket.join(societyRoom);
      socket.join(roleRoom);

      logger.info(
        `${SEP} [SOCKET][CONNECTED] id=${user.id} role=${user.role} source=${user.source} ` +
        `socketId=${socket.id} rooms=[${privateRoom}, ${societyRoom}, ${roleRoom}]`
      );

      socket.on('disconnect', (reason) => {
        logger.info(
          `${SEP} [SOCKET][DISCONNECTED] id=${user.id} role=${user.role} ` +
          `socketId=${socket.id} privateRoom=${privateRoom} reason=${reason}`
        );
      });

      socket.on('error', (err) => {
        logger.info(
          `${SEP} [SOCKET][ERROR] id=${user.id} role=${user.role} ` +
          `socketId=${socket.id} error=${err.message}`
        );
      });
    });

    logger.info(`${SEP} [SOCKET][INIT] Socket.io initialized`);
  }

  private readonly SEP = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  /** Emit to a specific resident/user by their DB id */
  emitToUser(userId: number, event: string, data: unknown): void {
    const room = `user_${userId}`;
    logger.info(`${this.SEP} [SOCKET][EMIT→USER] room=${room} event=${event} data=${JSON.stringify(data)}`);
    this.io?.to(room).emit(event, data);
  }

  /** Emit to a specific staff member by their DB id */
  emitToStaff(staffId: number, event: string, data: unknown): void {
    const room = `security_${staffId}`;
    logger.info(`${this.SEP} [SOCKET][EMIT→STAFF] room=${room} event=${event} data=${JSON.stringify(data)}`);
    this.io?.to(room).emit(event, data);
  }

  /** Emit to all security staff in a society */
  emitToSocietySecurity(societyId: number, event: string, data: unknown): void {
    const room = `society_${societyId}_security`;
    logger.info(`${this.SEP} [SOCKET][EMIT→SECURITY] room=${room} event=${event} data=${JSON.stringify(data)}`);
    this.io?.to(room).emit(event, data);
  }

  /** Emit to all users (residents) in a society */
  emitToSocietyUsers(societyId: number, event: string, data: unknown): void {
    const room = `society_${societyId}_user`;
    logger.info(`${this.SEP} [SOCKET][EMIT→RESIDENTS] room=${room} event=${event} data=${JSON.stringify(data)}`);
    this.io?.to(room).emit(event, data);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export default new SocketService();

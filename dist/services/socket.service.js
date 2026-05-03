"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../config/app"));
const logger_1 = __importDefault(require("../utils/logger"));
class SocketService {
    constructor() {
        this.io = null;
    }
    init(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            transports: ['websocket', 'polling'],
        });
        // JWT auth middleware for socket connections
        this.io.use((socket, next) => {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error('Authentication required'));
            try {
                const decoded = jsonwebtoken_1.default.verify(token, app_1.default.jwt.secret);
                socket.data.user = decoded;
                next();
            }
            catch {
                next(new Error('Invalid token'));
            }
        });
        this.io.on('connection', (socket) => {
            const user = socket.data.user;
            logger_1.default.info(`Socket connected: user ${user.id} (${user.role}) society ${user.society_id}`);
            // Per-user/staff room — source-prefixed to avoid ID collisions across tables
            const privateRoom = user.source === 'security' ? `security_${user.id}` : `user_${user.id}`;
            socket.join(privateRoom);
            // Society-wide room
            socket.join(`society_${user.society_id}`);
            // Role room within society — e.g. society_1_security
            socket.join(`society_${user.society_id}_${user.role}`);
            socket.on('disconnect', () => {
                logger_1.default.info(`Socket disconnected: user ${user.id}`);
            });
        });
        logger_1.default.info('Socket.io initialized');
    }
    /** Emit to a specific resident/user by their DB id */
    emitToUser(userId, event, data) {
        this.io?.to(`user_${userId}`).emit(event, data);
    }
    /** Emit to a specific staff member by their DB id */
    emitToStaff(staffId, event, data) {
        this.io?.to(`security_${staffId}`).emit(event, data);
    }
    /** Emit to all security staff in a society */
    emitToSocietySecurity(societyId, event, data) {
        this.io?.to(`society_${societyId}_security`).emit(event, data);
    }
    /** Emit to all users (residents) in a society */
    emitToSocietyUsers(societyId, event, data) {
        this.io?.to(`society_${societyId}_user`).emit(event, data);
    }
    getIO() {
        return this.io;
    }
}
exports.default = new SocketService();
//# sourceMappingURL=socket.service.js.map
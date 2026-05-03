import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
declare class SocketService {
    private io;
    init(httpServer: HttpServer): void;
    /** Emit to a specific resident/user by their DB id */
    emitToUser(userId: number, event: string, data: unknown): void;
    /** Emit to a specific staff member by their DB id */
    emitToStaff(staffId: number, event: string, data: unknown): void;
    /** Emit to all security staff in a society */
    emitToSocietySecurity(societyId: number, event: string, data: unknown): void;
    /** Emit to all users (residents) in a society */
    emitToSocietyUsers(societyId: number, event: string, data: unknown): void;
    getIO(): SocketIOServer | null;
}
declare const _default: SocketService;
export default _default;
//# sourceMappingURL=socket.service.d.ts.map
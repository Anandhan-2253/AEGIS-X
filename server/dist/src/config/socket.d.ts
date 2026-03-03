import { Server } from 'socket.io';
import { SocketEvent } from '../types';
export declare function setSocketServer(io: Server): void;
export declare function getSocketServer(): Server;
export declare function emitSocketEvent(event: SocketEvent, payload: unknown): void;
//# sourceMappingURL=socket.d.ts.map
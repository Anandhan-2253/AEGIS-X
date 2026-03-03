import { Server } from 'socket.io';
import { SocketEvent } from '../types';

let ioServer: Server | null = null;

export function setSocketServer(io: Server): void {
  ioServer = io;
}

export function getSocketServer(): Server {
  if (!ioServer) {
    throw new Error('Socket server is not initialized');
  }
  return ioServer;
}

export function emitSocketEvent(event: SocketEvent, payload: unknown): void {
  if (!ioServer) return;
  ioServer.emit(event, payload);
}

import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createApp } from './app';
import { closeDatabase } from './config/database';
import { assertSecureRuntime, env } from './config/env';
import { closeQueue } from './config/queue';
import { closeRedis } from './config/redis';
import { logger } from './config/logger';
import { setSocketServer } from './config/socket';
import { TokenPayload } from './types';

assertSecureRuntime();

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.SOCKET_CORS_ORIGIN,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Socket token missing'));
    }

    jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    return next();
  } catch {
    return next(new Error('Socket authentication failed'));
  }
});

io.on('connection', socket => {
  logger.info('socket_connected', { socketId: socket.id });
  socket.on('disconnect', reason => {
    logger.info('socket_disconnected', { socketId: socket.id, reason });
  });
});

setSocketServer(io);

server.listen(env.PORT, () => {
  logger.info('server_started', {
    port: env.PORT,
    env: env.NODE_ENV,
    apiBase: `/api/${env.API_VERSION}`,
  });
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.warn('shutdown_started', { signal });

  server.close(async closeError => {
    if (closeError) {
      logger.error('server_close_failed', { error: closeError.message });
      process.exit(1);
      return;
    }

    try {
      await Promise.all([closeQueue(), closeDatabase(), closeRedis()]);
      io.close();
      logger.info('shutdown_completed');
      process.exit(0);
    } catch (error) {
      logger.error('shutdown_failed', {
        error: error instanceof Error ? error.message : 'unknown',
      });
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

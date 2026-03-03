"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const queue_1 = require("./config/queue");
const redis_1 = require("./config/redis");
const logger_1 = require("./config/logger");
const socket_1 = require("./config/socket");
(0, env_1.assertSecureRuntime)();
const app = (0, app_1.createApp)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.env.SOCKET_CORS_ORIGIN,
        credentials: true,
    },
});
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Socket token missing'));
        }
        jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        return next();
    }
    catch {
        return next(new Error('Socket authentication failed'));
    }
});
io.on('connection', socket => {
    logger_1.logger.info('socket_connected', { socketId: socket.id });
    socket.on('disconnect', reason => {
        logger_1.logger.info('socket_disconnected', { socketId: socket.id, reason });
    });
});
(0, socket_1.setSocketServer)(io);
server.listen(env_1.env.PORT, () => {
    logger_1.logger.info('server_started', {
        port: env_1.env.PORT,
        env: env_1.env.NODE_ENV,
        apiBase: `/api/${env_1.env.API_VERSION}`,
    });
});
let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    logger_1.logger.warn('shutdown_started', { signal });
    server.close(async (closeError) => {
        if (closeError) {
            logger_1.logger.error('server_close_failed', { error: closeError.message });
            process.exit(1);
            return;
        }
        try {
            await Promise.all([(0, queue_1.closeQueue)(), (0, database_1.closeDatabase)(), (0, redis_1.closeRedis)()]);
            io.close();
            logger_1.logger.info('shutdown_completed');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('shutdown_failed', {
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
//# sourceMappingURL=server.js.map
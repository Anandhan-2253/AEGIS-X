"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../config/logger");
function requestLogger(req, res, next) {
    const startedAt = Date.now();
    const requestId = req.requestId;
    logger_1.logger.info('request_received', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    res.on('finish', () => {
        logger_1.logger.info('request_completed', {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const http_status_codes_1 = require("http-status-codes");
const logger_1 = require("../config/logger");
const errors_1 = require("../utils/errors");
function notFoundHandler(req, res) {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
        requestId: req.requestId,
    });
}
function errorHandler(error, req, res, _next) {
    const appError = error instanceof errors_1.AppError
        ? error
        : new errors_1.AppError('Internal server error', http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, false);
    logger_1.logger.error('request_failed', {
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
        statusCode: appError.statusCode,
        message: appError.message,
        stack: error instanceof Error ? error.stack : undefined,
        details: appError.details,
    });
    res.status(appError.statusCode).json({
        success: false,
        error: appError.message,
        details: appError.details,
        requestId: req.requestId,
    });
}
//# sourceMappingURL=errorHandler.js.map
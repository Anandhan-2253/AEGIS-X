"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessingError = exports.ExternalServiceError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
const http_status_codes_1 = require("http-status-codes");
class AppError extends Error {
    constructor(message, statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, http_status_codes_1.StatusCodes.BAD_REQUEST, true, details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, http_status_codes_1.StatusCodes.FORBIDDEN);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, http_status_codes_1.StatusCodes.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, http_status_codes_1.StatusCodes.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
class ExternalServiceError extends AppError {
    constructor(service, message) {
        super(`${service} error: ${message}`, http_status_codes_1.StatusCodes.BAD_GATEWAY);
    }
}
exports.ExternalServiceError = ExternalServiceError;
class FileProcessingError extends AppError {
    constructor(message) {
        super(message, http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY);
    }
}
exports.FileProcessingError = FileProcessingError;
//# sourceMappingURL=errors.js.map
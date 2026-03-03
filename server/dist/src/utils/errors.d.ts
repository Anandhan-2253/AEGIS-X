export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly details?: Record<string, unknown>;
    constructor(message: string, statusCode?: number, isOperational?: boolean, details?: Record<string, unknown>);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ExternalServiceError extends AppError {
    constructor(service: string, message: string);
}
export declare class FileProcessingError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map
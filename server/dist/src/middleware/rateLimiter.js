"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const commonConfig = {
    standardHeaders: true,
    legacyHeaders: false,
};
exports.apiLimiter = (0, express_rate_limit_1.default)({
    ...commonConfig,
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: { success: false, error: 'Too many requests. Slow down and retry.' },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    ...commonConfig,
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.AUTH_RATE_LIMIT_MAX,
    message: { success: false, error: 'Too many authentication attempts.' },
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    ...commonConfig,
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { success: false, error: 'Upload quota exceeded for this hour.' },
});
//# sourceMappingURL=rateLimiter.js.map
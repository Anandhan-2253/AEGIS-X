"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
function clientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip ?? '0.0.0.0';
}
function userAgent(req) {
    return req.headers['user-agent'] ?? 'unknown';
}
exports.authController = {
    async register(req, res) {
        const result = await authService_1.authService.register({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            ipAddress: clientIp(req),
            userAgent: userAgent(req),
        });
        res.status(201).json({
            success: true,
            data: result,
            requestId: req.requestId,
        });
    },
    async login(req, res) {
        const result = await authService_1.authService.login({
            email: req.body.email,
            password: req.body.password,
            ipAddress: clientIp(req),
            userAgent: userAgent(req),
        });
        res.status(200).json({
            success: true,
            data: result,
            requestId: req.requestId,
        });
    },
    async refresh(req, res) {
        const result = await authService_1.authService.refresh({
            refreshToken: req.body.refreshToken,
            ipAddress: clientIp(req),
            userAgent: userAgent(req),
        });
        res.status(200).json({
            success: true,
            data: result,
            requestId: req.requestId,
        });
    },
};
//# sourceMappingURL=authController.js.map
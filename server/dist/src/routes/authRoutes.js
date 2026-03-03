"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthRoutes = buildAuthRoutes;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const asyncHandler_1 = require("../utils/asyncHandler");
function buildAuthRoutes() {
    const router = (0, express_1.Router)();
    router.post('/register', rateLimiter_1.authLimiter, (0, validate_1.validate)(schemas_1.registerSchema), (0, asyncHandler_1.asyncHandler)(authController_1.authController.register));
    router.post('/login', rateLimiter_1.authLimiter, (0, validate_1.validate)(schemas_1.loginSchema), (0, asyncHandler_1.asyncHandler)(authController_1.authController.login));
    router.post('/refresh', rateLimiter_1.authLimiter, (0, validate_1.validate)(schemas_1.refreshTokenSchema), (0, asyncHandler_1.asyncHandler)(authController_1.authController.refresh));
    return router;
}
//# sourceMappingURL=authRoutes.js.map
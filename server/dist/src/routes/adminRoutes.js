"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAdminRoutes = buildAdminRoutes;
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const types_1 = require("../types");
const asyncHandler_1 = require("../utils/asyncHandler");
function buildAdminRoutes() {
    const router = (0, express_1.Router)();
    router.use(authenticate_1.authenticate);
    router.use((0, authorize_1.authorize)([types_1.UserRole.ADMIN]));
    router.get('/users', (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.listUsers));
    router.patch('/users/:userId/role', (0, validate_1.validate)(schemas_1.updateUserRoleSchema), (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.updateUserRole));
    router.patch('/users/:userId/status', (0, validate_1.validate)(schemas_1.updateUserStatusSchema), (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.updateUserStatus));
    router.get('/audit-logs', (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(adminController_1.adminController.listAuditLogs));
    return router;
}
//# sourceMappingURL=adminRoutes.js.map
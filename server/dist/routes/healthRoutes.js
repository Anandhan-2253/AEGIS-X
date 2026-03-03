"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHealthRoutes = buildHealthRoutes;
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const types_1 = require("../types");
const asyncHandler_1 = require("../utils/asyncHandler");
function buildHealthRoutes() {
    const router = (0, express_1.Router)();
    router.get('/', (0, asyncHandler_1.asyncHandler)(healthController_1.healthController.health));
    router.get('/worker', authenticate_1.authenticate, (0, authorize_1.authorize)([types_1.UserRole.ADMIN]), (0, asyncHandler_1.asyncHandler)(healthController_1.healthController.workerStatus));
    return router;
}
//# sourceMappingURL=healthRoutes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildThreatIntelRoutes = buildThreatIntelRoutes;
const express_1 = require("express");
const threatIntelController_1 = require("../controllers/threatIntelController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const types_1 = require("../types");
const asyncHandler_1 = require("../utils/asyncHandler");
const zod_1 = require("zod");
function buildThreatIntelRoutes() {
    const router = (0, express_1.Router)();
    router.use(authenticate_1.authenticate);
    router.post('/query', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST]), (0, validate_1.validate)(schemas_1.iocQuerySchema), (0, asyncHandler_1.asyncHandler)(threatIntelController_1.threatIntelController.queryIOC));
    router.post('/', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST]), (0, validate_1.validate)(schemas_1.createThreatIntelSchema), (0, asyncHandler_1.asyncHandler)(threatIntelController_1.threatIntelController.createIntel));
    router.post('/correlate', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST]), (0, validate_1.validate)(zod_1.z.object({ evidence: zod_1.z.string().min(1).max(20000) })), (0, asyncHandler_1.asyncHandler)(threatIntelController_1.threatIntelController.correlate));
    router.get('/', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.VIEWER]), (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(threatIntelController_1.threatIntelController.listIntel));
    return router;
}
//# sourceMappingURL=threatIntelRoutes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAIRoutes = buildAIRoutes;
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const types_1 = require("../types");
const asyncHandler_1 = require("../utils/asyncHandler");
function buildAIRoutes() {
    const router = (0, express_1.Router)();
    router.use(authenticate_1.authenticate);
    router.post('/analyze', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.PENTESTER]), (0, validate_1.validate)(schemas_1.aiAnalysisSchema), (0, asyncHandler_1.asyncHandler)(aiController_1.aiController.analyze));
    return router;
}
//# sourceMappingURL=aiRoutes.js.map
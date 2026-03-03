"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSOCRoutes = buildSOCRoutes;
const express_1 = require("express");
const socController_1 = require("../controllers/socController");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../models/schemas");
const types_1 = require("../types");
const asyncHandler_1 = require("../utils/asyncHandler");
function buildSOCRoutes() {
    const router = (0, express_1.Router)();
    router.use(authenticate_1.authenticate);
    router.post('/logs/ingest', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST]), (0, validate_1.validate)(schemas_1.ingestLogSchema), (0, asyncHandler_1.asyncHandler)(socController_1.socController.ingestLog));
    router.post('/logs/ingest-batch', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST]), (0, validate_1.validate)(schemas_1.ingestLogBatchSchema), (0, asyncHandler_1.asyncHandler)(socController_1.socController.ingestLogBatch));
    router.get('/logs', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.VIEWER]), (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(socController_1.socController.listLogs));
    router.get('/alerts', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.VIEWER]), (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(socController_1.socController.listAlerts));
    router.post('/incidents', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST]), (0, validate_1.validate)(schemas_1.createIncidentSchema), (0, asyncHandler_1.asyncHandler)(socController_1.socController.createIncident));
    router.get('/incidents', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.VIEWER]), (0, validate_1.validate)(schemas_1.paginationSchema, 'query'), (0, asyncHandler_1.asyncHandler)(socController_1.socController.listIncidents));
    router.patch('/incidents/:id', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST]), (0, validate_1.validate)(schemas_1.updateIncidentSchema), (0, asyncHandler_1.asyncHandler)(socController_1.socController.updateIncident));
    router.get('/incidents/:id/timeline', (0, authorize_1.authorize)([types_1.UserRole.ADMIN, types_1.UserRole.SOC_ANALYST, types_1.UserRole.MALWARE_ANALYST, types_1.UserRole.VIEWER]), (0, asyncHandler_1.asyncHandler)(socController_1.socController.incidentTimeline));
    return router;
}
//# sourceMappingURL=socRoutes.js.map
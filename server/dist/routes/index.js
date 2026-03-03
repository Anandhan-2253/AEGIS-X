"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRouter = buildRouter;
const express_1 = require("express");
const adminRoutes_1 = require("./adminRoutes");
const aiRoutes_1 = require("./aiRoutes");
const authRoutes_1 = require("./authRoutes");
const healthRoutes_1 = require("./healthRoutes");
const malwareRoutes_1 = require("./malwareRoutes");
const pentestRoutes_1 = require("./pentestRoutes");
const socRoutes_1 = require("./socRoutes");
const threatIntelRoutes_1 = require("./threatIntelRoutes");
function buildRouter() {
    const router = (0, express_1.Router)();
    router.use('/auth', (0, authRoutes_1.buildAuthRoutes)());
    router.use('/health', (0, healthRoutes_1.buildHealthRoutes)());
    router.use('/soc', (0, socRoutes_1.buildSOCRoutes)());
    router.use('/malware', (0, malwareRoutes_1.buildMalwareRoutes)());
    router.use('/threat-intel', (0, threatIntelRoutes_1.buildThreatIntelRoutes)());
    router.use('/pentest', (0, pentestRoutes_1.buildPentestRoutes)());
    router.use('/admin', (0, adminRoutes_1.buildAdminRoutes)());
    router.use('/ai', (0, aiRoutes_1.buildAIRoutes)());
    return router;
}
//# sourceMappingURL=index.js.map
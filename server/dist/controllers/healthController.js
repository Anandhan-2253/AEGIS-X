"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const healthService_1 = require("../services/healthService");
const workerService_1 = require("../services/workerService");
exports.healthController = {
    async health(req, res) {
        const data = await healthService_1.healthService.getSystemHealth();
        const statusCode = data.status == 'healthy' ? 200 : 503;
        res.status(statusCode).json({ success: data.status === 'healthy', data, requestId: req.requestId });
    },
    async workerStatus(req, res) {
        const data = await workerService_1.workerService.getStatus();
        res.status(200).json({ success: true, data, requestId: req.requestId });
    },
};
//# sourceMappingURL=healthController.js.map
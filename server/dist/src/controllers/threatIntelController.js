"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threatIntelController = void 0;
const threatIntelService_1 = require("../services/threatIntelService");
exports.threatIntelController = {
    async queryIOC(req, res) {
        const data = await threatIntelService_1.threatIntelService.queryIOC(req.body.iocType, req.body.iocValue);
        res.status(200).json({ success: true, data, requestId: req.requestId });
    },
    async createIntel(req, res) {
        const data = await threatIntelService_1.threatIntelService.createIntel(req.body);
        res.status(201).json({ success: true, data, requestId: req.requestId });
    },
    async listIntel(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await threatIntelService_1.threatIntelService.listIntel(page, limit);
        res.status(200).json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
    async correlate(req, res) {
        const data = await threatIntelService_1.threatIntelService.correlateEvidence(req.body.evidence);
        res.status(200).json({ success: true, data, requestId: req.requestId });
    },
};
//# sourceMappingURL=threatIntelController.js.map
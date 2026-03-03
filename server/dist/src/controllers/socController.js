"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socController = void 0;
const socService_1 = require("../services/socService");
function getMeta(req) {
    return {
        actorId: req.user?.userId,
        ipAddress: req.ip ?? '0.0.0.0',
        userAgent: req.headers['user-agent'] ?? 'unknown',
    };
}
exports.socController = {
    async ingestLog(req, res) {
        const result = await socService_1.socService.ingestLog({
            source: req.body.source,
            logType: req.body.logType,
            severity: req.body.severity,
            message: req.body.message,
            rawData: req.body.rawData,
            sourceIp: req.body.sourceIp,
            destinationIp: req.body.destinationIp,
            eventTimestamp: req.body.eventTimestamp ? new Date(req.body.eventTimestamp) : undefined,
            ...getMeta(req),
        });
        res.status(202).json({ success: true, data: result, requestId: req.requestId });
    },
    async ingestLogBatch(req, res) {
        const result = await socService_1.socService.ingestLogBatch({
            logs: req.body.logs.map((log) => ({
                source: String(log.source),
                logType: String(log.logType),
                severity: log.severity,
                message: String(log.message),
                rawData: (log.rawData ?? {}),
                sourceIp: (log.sourceIp ?? null),
                destinationIp: (log.destinationIp ?? null),
                eventTimestamp: log.eventTimestamp ? new Date(String(log.eventTimestamp)) : undefined,
            })),
            ...getMeta(req),
        });
        res.status(202).json({ success: true, data: result, requestId: req.requestId });
    },
    async createIncident(req, res) {
        const incident = await socService_1.socService.createManualIncident({
            title: req.body.title,
            description: req.body.description,
            severity: req.body.severity,
            source: req.body.source,
            assignedTo: req.body.assignedTo,
            mitreTactic: req.body.mitreTactic,
            mitreTechnique: req.body.mitreTechnique,
            alertIds: req.body.alertIds,
            createdBy: req.user.userId,
            ipAddress: req.ip ?? '0.0.0.0',
            userAgent: req.headers['user-agent'] ?? 'unknown',
        });
        res.status(201).json({ success: true, data: incident, requestId: req.requestId });
    },
    async updateIncident(req, res) {
        const updated = await socService_1.socService.updateIncidentState({
            incidentId: req.params.id,
            updates: req.body,
            actorId: req.user.userId,
            ipAddress: req.ip ?? '0.0.0.0',
            userAgent: req.headers['user-agent'] ?? 'unknown',
        });
        res.status(200).json({ success: true, data: updated, requestId: req.requestId });
    },
    async incidentTimeline(req, res) {
        const timeline = await socService_1.socService.getIncidentTimeline(req.params.id);
        res.status(200).json({ success: true, data: timeline, requestId: req.requestId });
    },
    async listIncidents(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await socService_1.socService.listIncidents(page, limit);
        res.status(200).json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
    async listAlerts(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await socService_1.socService.listAlerts(page, limit);
        res.status(200).json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
    async listLogs(req, res) {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);
        const data = await socService_1.socService.listLogs(page, limit);
        res.status(200).json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: data.total },
            requestId: req.requestId,
        });
    },
};
//# sourceMappingURL=socController.js.map
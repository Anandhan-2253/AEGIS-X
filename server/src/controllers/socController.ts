import { Request, Response } from 'express';
import { socService } from '../services/socService';

function getMeta(req: Request) {
  return {
    actorId: req.user?.userId,
    ipAddress: req.ip ?? '0.0.0.0',
    userAgent: req.headers['user-agent'] ?? 'unknown',
  };
}

export const socController = {
  async ingestLog(req: Request, res: Response): Promise<void> {
    const result = await socService.ingestLog({
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

  async ingestLogBatch(req: Request, res: Response): Promise<void> {
    const result = await socService.ingestLogBatch({
      logs: req.body.logs.map((log: Record<string, unknown>) => ({
        source: String(log.source),
        logType: String(log.logType),
        severity: log.severity as any,
        message: String(log.message),
        rawData: (log.rawData ?? {}) as Record<string, unknown>,
        sourceIp: (log.sourceIp ?? null) as string | null,
        destinationIp: (log.destinationIp ?? null) as string | null,
        eventTimestamp: log.eventTimestamp ? new Date(String(log.eventTimestamp)) : undefined,
      })),
      ...getMeta(req),
    });

    res.status(202).json({ success: true, data: result, requestId: req.requestId });
  },

  async createIncident(req: Request, res: Response): Promise<void> {
    const incident = await socService.createManualIncident({
      title: req.body.title,
      description: req.body.description,
      severity: req.body.severity,
      source: req.body.source,
      assignedTo: req.body.assignedTo,
      mitreTactic: req.body.mitreTactic,
      mitreTechnique: req.body.mitreTechnique,
      alertIds: req.body.alertIds,
      createdBy: req.user!.userId,
      ipAddress: req.ip ?? '0.0.0.0',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.status(201).json({ success: true, data: incident, requestId: req.requestId });
  },

  async updateIncident(req: Request, res: Response): Promise<void> {
    const updated = await socService.updateIncidentState({
      incidentId: req.params.id,
      updates: req.body,
      actorId: req.user!.userId,
      ipAddress: req.ip ?? '0.0.0.0',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.status(200).json({ success: true, data: updated, requestId: req.requestId });
  },

  async incidentTimeline(req: Request, res: Response): Promise<void> {
    const timeline = await socService.getIncidentTimeline(req.params.id);
    res.status(200).json({ success: true, data: timeline, requestId: req.requestId });
  },

  async listIncidents(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await socService.listIncidents(page, limit);

    res.status(200).json({
      success: true,
      data: data.rows,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },

  async listAlerts(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await socService.listAlerts(page, limit);

    res.status(200).json({
      success: true,
      data: data.rows,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },

  async listLogs(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await socService.listLogs(page, limit);

    res.status(200).json({
      success: true,
      data: data.rows,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },
};

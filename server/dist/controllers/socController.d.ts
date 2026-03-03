import { Request, Response } from 'express';
export declare const socController: {
    ingestLog(req: Request, res: Response): Promise<void>;
    ingestLogBatch(req: Request, res: Response): Promise<void>;
    createIncident(req: Request, res: Response): Promise<void>;
    updateIncident(req: Request, res: Response): Promise<void>;
    incidentTimeline(req: Request, res: Response): Promise<void>;
    listIncidents(req: Request, res: Response): Promise<void>;
    listAlerts(req: Request, res: Response): Promise<void>;
    listLogs(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=socController.d.ts.map
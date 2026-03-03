import { Request, Response } from 'express';
import { healthService } from '../services/healthService';
import { workerService } from '../services/workerService';

export const healthController = {
  async health(req: Request, res: Response): Promise<void> {
    const data = await healthService.getSystemHealth();
    const statusCode = data.status == 'healthy' ? 200 : 503;
    res.status(statusCode).json({ success: data.status === 'healthy', data, requestId: req.requestId });
  },

  async workerStatus(req: Request, res: Response): Promise<void> {
    const data = await workerService.getStatus();
    res.status(200).json({ success: true, data, requestId: req.requestId });
  },
};

import { Request, Response } from 'express';
import { threatIntelService } from '../services/threatIntelService';

export const threatIntelController = {
  async queryIOC(req: Request, res: Response): Promise<void> {
    const data = await threatIntelService.queryIOC(req.body.iocType, req.body.iocValue);
    res.status(200).json({ success: true, data, requestId: req.requestId });
  },

  async createIntel(req: Request, res: Response): Promise<void> {
    const data = await threatIntelService.createIntel(req.body);
    res.status(201).json({ success: true, data, requestId: req.requestId });
  },

  async listIntel(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await threatIntelService.listIntel(page, limit);

    res.status(200).json({
      success: true,
      data: data.rows,
      meta: { page, limit, total: data.total },
      requestId: req.requestId,
    });
  },

  async correlate(req: Request, res: Response): Promise<void> {
    const data = await threatIntelService.correlateEvidence(req.body.evidence);
    res.status(200).json({ success: true, data, requestId: req.requestId });
  },
};

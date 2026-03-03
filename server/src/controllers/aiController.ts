import { Request, Response } from 'express';
import { aiService } from '../ai/aiService';

export const aiController = {
  async analyze(req: Request, res: Response): Promise<void> {
    const { type, context } = req.body;

    let data: Record<string, unknown>;

    if (type === 'incident_summary') {
      data = await aiService.summarizeIncident(context);
    } else if (type === 'threat_classification') {
      data = await aiService.classifyThreat(context);
    } else if (type === 'malware_explanation') {
      data = await aiService.explainMalwareBehavior(context);
    } else if (type === 'remediation') {
      data = await aiService.remediationRecommendations(context);
    } else {
      data = await aiService.generateExecutiveReport(context);
    }

    res.status(200).json({ success: true, data, requestId: req.requestId });
  },
};

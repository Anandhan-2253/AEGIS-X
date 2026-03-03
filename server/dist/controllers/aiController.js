"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const aiService_1 = require("../ai/aiService");
exports.aiController = {
    async analyze(req, res) {
        const { type, context } = req.body;
        let data;
        if (type === 'incident_summary') {
            data = await aiService_1.aiService.summarizeIncident(context);
        }
        else if (type === 'threat_classification') {
            data = await aiService_1.aiService.classifyThreat(context);
        }
        else if (type === 'malware_explanation') {
            data = await aiService_1.aiService.explainMalwareBehavior(context);
        }
        else if (type === 'remediation') {
            data = await aiService_1.aiService.remediationRecommendations(context);
        }
        else {
            data = await aiService_1.aiService.generateExecutiveReport(context);
        }
        res.status(200).json({ success: true, data, requestId: req.requestId });
    },
};
//# sourceMappingURL=aiController.js.map
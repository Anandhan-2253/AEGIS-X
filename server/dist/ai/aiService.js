"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const errors_1 = require("../utils/errors");
const sanitizer_1 = require("../utils/sanitizer");
const promptTemplates_1 = require("./promptTemplates");
class AIService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.env.AI_SERVICE_URL,
            timeout: env_1.env.AI_REQUEST_TIMEOUT_MS,
            headers: {
                'content-type': 'application/json',
            },
        });
    }
    sanitizeInput(input) {
        const normalized = typeof input === 'string' ? input : JSON.stringify(input);
        const safeText = (0, sanitizer_1.sanitizeForPrompt)(normalized);
        return (0, sanitizer_1.truncateForTokenLimit)(safeText, 8000);
    }
    buildPrompt(task, context) {
        const safeContextJson = this.sanitizeInput(context);
        switch (task) {
            case 'incident_summary':
                return promptTemplates_1.promptTemplates.incidentSummary(safeContextJson);
            case 'threat_classification':
                return promptTemplates_1.promptTemplates.threatClassification(safeContextJson);
            case 'malware_explanation':
                return promptTemplates_1.promptTemplates.malwareExplanation(safeContextJson);
            case 'remediation':
                return promptTemplates_1.promptTemplates.remediation(safeContextJson);
            case 'executive_report':
                return promptTemplates_1.promptTemplates.executiveReport(safeContextJson);
            default:
                return promptTemplates_1.promptTemplates.incidentSummary(safeContextJson);
        }
    }
    parseResponse(text) {
        const sanitized = (0, sanitizer_1.sanitizeText)(text);
        const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { raw: sanitized, json: null };
        }
        try {
            return {
                raw: sanitized,
                json: JSON.parse(jsonMatch[0]),
            };
        }
        catch {
            return { raw: sanitized, json: null };
        }
    }
    async invoke(task, context) {
        const prompt = this.buildPrompt(task, context);
        try {
            const response = await this.client.post('/generate', {
                model: env_1.env.AI_MODEL,
                prompt,
                max_tokens: env_1.env.AI_MAX_TOKENS,
                temperature: 0.2,
            });
            const output = response.data?.response ??
                response.data?.output ??
                response.data?.text ??
                JSON.stringify(response.data);
            return this.parseResponse(String(output));
        }
        catch (error) {
            logger_1.logger.error('ai_request_failed', {
                task,
                error: error instanceof Error ? error.message : 'unknown',
            });
            throw new errors_1.ExternalServiceError('AIRllm', 'Inference request failed');
        }
    }
    async summarizeIncident(context) {
        const result = await this.invoke('incident_summary', context);
        return result.json ?? { summary: result.raw };
    }
    async classifyThreat(context) {
        const result = await this.invoke('threat_classification', context);
        return result.json ?? { category: 'unknown', rationale: result.raw };
    }
    async explainMalwareBehavior(context) {
        const result = await this.invoke('malware_explanation', context);
        return result.json ?? { behavior_summary: result.raw };
    }
    async remediationRecommendations(context) {
        const result = await this.invoke('remediation', context);
        return result.json ?? { immediate_actions: [result.raw] };
    }
    async generateExecutiveReport(context) {
        const result = await this.invoke('executive_report', context);
        return result.json ?? { executive_summary: result.raw };
    }
}
exports.aiService = new AIService();
//# sourceMappingURL=aiService.js.map
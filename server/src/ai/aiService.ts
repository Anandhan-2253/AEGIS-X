import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ExternalServiceError } from '../utils/errors';
import { sanitizeForPrompt, sanitizeText, truncateForTokenLimit } from '../utils/sanitizer';
import { promptTemplates } from './promptTemplates';

type AnalysisTask =
  | 'incident_summary'
  | 'threat_classification'
  | 'malware_explanation'
  | 'remediation'
  | 'executive_report';

interface ParsedAIResult {
  raw: string;
  json: Record<string, unknown> | null;
}

class AIService {
  private readonly client = axios.create({
    baseURL: env.AI_SERVICE_URL,
    timeout: env.AI_REQUEST_TIMEOUT_MS,
    headers: {
      'content-type': 'application/json',
    },
  });

  private sanitizeInput(input: unknown): string {
    const normalized = typeof input === 'string' ? input : JSON.stringify(input);
    const safeText = sanitizeForPrompt(normalized);
    return truncateForTokenLimit(safeText, 8000);
  }

  private buildPrompt(task: AnalysisTask, context: unknown): string {
    const safeContextJson = this.sanitizeInput(context);

    switch (task) {
      case 'incident_summary':
        return promptTemplates.incidentSummary(safeContextJson);
      case 'threat_classification':
        return promptTemplates.threatClassification(safeContextJson);
      case 'malware_explanation':
        return promptTemplates.malwareExplanation(safeContextJson);
      case 'remediation':
        return promptTemplates.remediation(safeContextJson);
      case 'executive_report':
        return promptTemplates.executiveReport(safeContextJson);
      default:
        return promptTemplates.incidentSummary(safeContextJson);
    }
  }

  private parseResponse(text: string): ParsedAIResult {
    const sanitized = sanitizeText(text);
    const jsonMatch = sanitized.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { raw: sanitized, json: null };
    }

    try {
      return {
        raw: sanitized,
        json: JSON.parse(jsonMatch[0]) as Record<string, unknown>,
      };
    } catch {
      return { raw: sanitized, json: null };
    }
  }

  private async invoke(task: AnalysisTask, context: unknown): Promise<ParsedAIResult> {
    const prompt = this.buildPrompt(task, context);

    try {
      const response = await this.client.post('/generate', {
        model: env.AI_MODEL,
        prompt,
        max_tokens: env.AI_MAX_TOKENS,
        temperature: 0.2,
      });

      const output =
        response.data?.response ??
        response.data?.output ??
        response.data?.text ??
        JSON.stringify(response.data);

      return this.parseResponse(String(output));
    } catch (error) {
      logger.error('ai_request_failed', {
        task,
        error: error instanceof Error ? error.message : 'unknown',
      });
      throw new ExternalServiceError('AIRllm', 'Inference request failed');
    }
  }

  async summarizeIncident(context: unknown): Promise<Record<string, unknown>> {
    const result = await this.invoke('incident_summary', context);
    return result.json ?? { summary: result.raw };
  }

  async classifyThreat(context: unknown): Promise<Record<string, unknown>> {
    const result = await this.invoke('threat_classification', context);
    return result.json ?? { category: 'unknown', rationale: result.raw };
  }

  async explainMalwareBehavior(context: unknown): Promise<Record<string, unknown>> {
    const result = await this.invoke('malware_explanation', context);
    return result.json ?? { behavior_summary: result.raw };
  }

  async remediationRecommendations(context: unknown): Promise<Record<string, unknown>> {
    const result = await this.invoke('remediation', context);
    return result.json ?? { immediate_actions: [result.raw] };
  }

  async generateExecutiveReport(context: unknown): Promise<Record<string, unknown>> {
    const result = await this.invoke('executive_report', context);
    return result.json ?? { executive_summary: result.raw };
  }
}

export const aiService = new AIService();

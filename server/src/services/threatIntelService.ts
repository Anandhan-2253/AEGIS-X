import { aiService } from '../ai/aiService';
import { MOCK_IP_REPUTATION_DB } from '../data/ipReputation';
import {
  findThreatIntel,
  listThreatIntel,
  ThreatIntelRecord,
  upsertThreatIntel,
} from '../repositories/threatIntelRepository';

const IOC_PATTERNS = {
  ip: /(?:\d{1,3}\.){3}\d{1,3}/g,
  domain: /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g,
  url: /https?:\/\/[^\s"']+/g,
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  hash: /[a-fA-F0-9]{32,64}/g,
};

function normalizeConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function inferThreatType(iocType: string, value: string): string {
  if (iocType === 'ip') return 'network_indicator';
  if (iocType === 'domain') return 'domain_indicator';
  if (iocType === 'url') return 'phishing_or_c2_url';
  if (iocType === 'email') return 'suspicious_email';
  if (value.length === 64) return 'file_hash_sha256';
  return 'file_hash_md5';
}

class ThreatIntelService {
  extractIOCs(payload: { message: string; rawData?: Record<string, unknown> }): Array<{ iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email'; iocValue: string }> {
    const sourceText = `${payload.message} ${JSON.stringify(payload.rawData ?? {})}`;
    const results: Array<{ iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email'; iocValue: string }> = [];

    const dedupe = new Set<string>();

    (Object.keys(IOC_PATTERNS) as Array<keyof typeof IOC_PATTERNS>).forEach(iocType => {
      const matches = sourceText.match(IOC_PATTERNS[iocType]) ?? [];
      matches.forEach(value => {
        const normalizedValue = value.toLowerCase();
        const key = `${iocType}:${normalizedValue}`;
        if (dedupe.has(key)) return;
        dedupe.add(key);
        results.push({ iocType, iocValue: normalizedValue });
      });
    });

    return results;
  }

  calculateRisk(iocType: string, iocValue: string): { confidence: number; riskScore: number; source: string; description: string } {
    if (iocType === 'ip') {
      const reputation = MOCK_IP_REPUTATION_DB[iocValue];
      if (reputation) {
        return {
          confidence: normalizeConfidence(reputation.score),
          riskScore: normalizeConfidence(reputation.score),
          source: reputation.provider,
          description: `IP reputation category=${reputation.category}`,
        };
      }

      return {
        confidence: 45,
        riskScore: 40,
        source: 'heuristic-engine',
        description: 'IP not found in known local reputation feed',
      };
    }

    if (iocType === 'url') {
      const suspicious = /(login|verify|secure|update|credential)/i.test(iocValue);
      return {
        confidence: suspicious ? 78 : 55,
        riskScore: suspicious ? 72 : 48,
        source: 'url-heuristics',
        description: suspicious ? 'URL contains phishing-like keywords' : 'URL observed in security telemetry',
      };
    }

    return {
      confidence: 65,
      riskScore: 60,
      source: 'ioc-heuristics',
      description: 'Indicator extracted from security event',
    };
  }

  async processLogIndicators(payload: {
    message: string;
    rawData?: Record<string, unknown>;
  }): Promise<ThreatIntelRecord[]> {
    const iocs = this.extractIOCs(payload);
    const saved: ThreatIntelRecord[] = [];

    for (const ioc of iocs) {
      const risk = this.calculateRisk(ioc.iocType, ioc.iocValue);
      const record = await upsertThreatIntel({
        iocType: ioc.iocType,
        iocValue: ioc.iocValue,
        threatType: inferThreatType(ioc.iocType, ioc.iocValue),
        confidence: risk.confidence,
        riskScore: risk.riskScore,
        source: risk.source,
        description: risk.description,
      });

      saved.push(record);
    }

    return saved;
  }

  async queryIOC(iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email', iocValue: string) {
    const existing = await findThreatIntel(iocType, iocValue.toLowerCase());
    if (existing) return existing;

    const calculated = this.calculateRisk(iocType, iocValue.toLowerCase());
    return upsertThreatIntel({
      iocType,
      iocValue: iocValue.toLowerCase(),
      threatType: inferThreatType(iocType, iocValue),
      confidence: calculated.confidence,
      riskScore: calculated.riskScore,
      source: calculated.source,
      description: calculated.description,
    });
  }

  async createIntel(entry: {
    iocType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    iocValue: string;
    threatType: string;
    confidence: number;
    source: string;
    description: string;
  }) {
    const riskScore = Math.max(0, Math.min(100, Math.round((entry.confidence * 0.75) + 15)));
    return upsertThreatIntel({
      ...entry,
      iocValue: entry.iocValue.toLowerCase(),
      confidence: normalizeConfidence(entry.confidence),
      riskScore,
    });
  }

  async listIntel(page: number, limit: number) {
    return listThreatIntel(page, limit);
  }

  async correlateEvidence(evidence: string) {
    const extracted = this.extractIOCs({ message: evidence, rawData: {} });
    const matches: ThreatIntelRecord[] = [];

    for (const ioc of extracted) {
      const existing = await findThreatIntel(ioc.iocType, ioc.iocValue);
      if (existing) {
        matches.push(existing);
      }
    }

    const aiClassification = await aiService.classifyThreat({
      evidence,
      matchedIndicators: matches,
    });

    return {
      indicators: extracted,
      matches,
      aiClassification,
    };
  }
}

export const threatIntelService = new ThreatIntelService();

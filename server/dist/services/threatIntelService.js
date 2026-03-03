"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threatIntelService = void 0;
const aiService_1 = require("../ai/aiService");
const ipReputation_1 = require("../data/ipReputation");
const threatIntelRepository_1 = require("../repositories/threatIntelRepository");
const IOC_PATTERNS = {
    ip: /(?:\d{1,3}\.){3}\d{1,3}/g,
    domain: /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g,
    url: /https?:\/\/[^\s"']+/g,
    email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    hash: /[a-fA-F0-9]{32,64}/g,
};
function normalizeConfidence(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function inferThreatType(iocType, value) {
    if (iocType === 'ip')
        return 'network_indicator';
    if (iocType === 'domain')
        return 'domain_indicator';
    if (iocType === 'url')
        return 'phishing_or_c2_url';
    if (iocType === 'email')
        return 'suspicious_email';
    if (value.length === 64)
        return 'file_hash_sha256';
    return 'file_hash_md5';
}
class ThreatIntelService {
    extractIOCs(payload) {
        const sourceText = `${payload.message} ${JSON.stringify(payload.rawData ?? {})}`;
        const results = [];
        const dedupe = new Set();
        Object.keys(IOC_PATTERNS).forEach(iocType => {
            const matches = sourceText.match(IOC_PATTERNS[iocType]) ?? [];
            matches.forEach(value => {
                const normalizedValue = value.toLowerCase();
                const key = `${iocType}:${normalizedValue}`;
                if (dedupe.has(key))
                    return;
                dedupe.add(key);
                results.push({ iocType, iocValue: normalizedValue });
            });
        });
        return results;
    }
    calculateRisk(iocType, iocValue) {
        if (iocType === 'ip') {
            const reputation = ipReputation_1.MOCK_IP_REPUTATION_DB[iocValue];
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
    async processLogIndicators(payload) {
        const iocs = this.extractIOCs(payload);
        const saved = [];
        for (const ioc of iocs) {
            const risk = this.calculateRisk(ioc.iocType, ioc.iocValue);
            const record = await (0, threatIntelRepository_1.upsertThreatIntel)({
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
    async queryIOC(iocType, iocValue) {
        const existing = await (0, threatIntelRepository_1.findThreatIntel)(iocType, iocValue.toLowerCase());
        if (existing)
            return existing;
        const calculated = this.calculateRisk(iocType, iocValue.toLowerCase());
        return (0, threatIntelRepository_1.upsertThreatIntel)({
            iocType,
            iocValue: iocValue.toLowerCase(),
            threatType: inferThreatType(iocType, iocValue),
            confidence: calculated.confidence,
            riskScore: calculated.riskScore,
            source: calculated.source,
            description: calculated.description,
        });
    }
    async createIntel(entry) {
        const riskScore = Math.max(0, Math.min(100, Math.round((entry.confidence * 0.75) + 15)));
        return (0, threatIntelRepository_1.upsertThreatIntel)({
            ...entry,
            iocValue: entry.iocValue.toLowerCase(),
            confidence: normalizeConfidence(entry.confidence),
            riskScore,
        });
    }
    async listIntel(page, limit) {
        return (0, threatIntelRepository_1.listThreatIntel)(page, limit);
    }
    async correlateEvidence(evidence) {
        const extracted = this.extractIOCs({ message: evidence, rawData: {} });
        const matches = [];
        for (const ioc of extracted) {
            const existing = await (0, threatIntelRepository_1.findThreatIntel)(ioc.iocType, ioc.iocValue);
            if (existing) {
                matches.push(existing);
            }
        }
        const aiClassification = await aiService_1.aiService.classifyThreat({
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
exports.threatIntelService = new ThreatIntelService();
//# sourceMappingURL=threatIntelService.js.map
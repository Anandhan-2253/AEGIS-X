"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAnalysisWorker = startAnalysisWorker;
const bullmq_1 = require("bullmq");
const aiService_1 = require("../ai/aiService");
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
const types_1 = require("../types");
const malwareAnalysisService_1 = require("../services/malwareAnalysisService");
const threatIntelService_1 = require("../services/threatIntelService");
async function upsertJobStatus(job, status, details) {
    const isFinal = status === 'COMPLETED' || status === 'FAILED';
    const completedAt = isFinal ? new Date() : null;
    await (0, database_1.query)(`
      INSERT INTO analysis_jobs (
        job_id,
        job_name,
        status,
        details,
        started_at,
        completed_at
      )
      VALUES ($1, $2, $3, $4::jsonb, NOW(), $5)
      ON CONFLICT (job_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        details = EXCLUDED.details,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
    `, [
        job.id ?? 'unknown-job',
        job.name,
        status,
        JSON.stringify(details ?? {}),
        completedAt,
    ]);
}
async function processAISummarization(job) {
    if (job.data.targetType === 'incident') {
        const summary = await aiService_1.aiService.summarizeIncident(job.data.content);
        await (0, database_1.query)(`
        INSERT INTO incident_events (incident_id, event_type, description, metadata)
        VALUES ($1, 'AI_SUMMARY', 'AI-generated incident summary created', $2::jsonb)
      `, [job.data.targetId, JSON.stringify(summary)]);
        return summary;
    }
    if (job.data.targetType === 'malware') {
        const report = await aiService_1.aiService.generateExecutiveReport(job.data.content);
        await (0, database_1.query)(`
        UPDATE malware_reports
        SET executive_summary = $2,
            updated_at = NOW()
        WHERE id = $1
      `, [job.data.targetId, JSON.stringify(report)]);
        return report;
    }
    const classification = await aiService_1.aiService.classifyThreat(job.data.content);
    await (0, database_1.query)(`
      INSERT INTO logs (source, log_type, severity, message, raw_data, event_timestamp)
      VALUES ('worker', 'ai_threat_classification', 'INFO', 'AI threat classification generated', $1::jsonb, NOW())
    `, [JSON.stringify({ targetId: job.data.targetId, classification })]);
    return classification;
}
async function processThreatClassification(job) {
    const indicators = await threatIntelService_1.threatIntelService.processLogIndicators({
        message: job.data.message,
        rawData: job.data.rawData,
    });
    const classification = await aiService_1.aiService.classifyThreat({
        logId: job.data.logId,
        message: job.data.message,
        rawData: job.data.rawData,
        indicators,
    });
    await (0, database_1.query)(`
      INSERT INTO logs (source, log_type, severity, message, raw_data, event_timestamp)
      VALUES ('worker', 'threat_classification', 'INFO', 'Threat classification completed', $1::jsonb, NOW())
    `, [JSON.stringify({ logId: job.data.logId, classification, indicatorCount: indicators.length })]);
    return {
        indicators: indicators.length,
        classification,
    };
}
function startAnalysisWorker() {
    const worker = new bullmq_1.Worker(env_1.env.QUEUE_NAME, async (job) => {
        await upsertJobStatus(job, 'PROCESSING');
        if (job.name === types_1.JobType.MALWARE_ANALYSIS) {
            await malwareAnalysisService_1.malwareAnalysisService.processMalwareAnalysisJob(job.data);
            await upsertJobStatus(job, 'COMPLETED', { type: types_1.JobType.MALWARE_ANALYSIS });
            return { ok: true };
        }
        if (job.name === types_1.JobType.AI_SUMMARIZATION) {
            const details = await processAISummarization(job);
            await upsertJobStatus(job, 'COMPLETED', { type: types_1.JobType.AI_SUMMARIZATION, details });
            return details;
        }
        if (job.name === types_1.JobType.THREAT_CLASSIFICATION) {
            const details = await processThreatClassification(job);
            await upsertJobStatus(job, 'COMPLETED', { type: types_1.JobType.THREAT_CLASSIFICATION, details });
            return details;
        }
        throw new Error(`Unsupported job type: ${job.name}`);
    }, {
        connection: (0, redis_1.getRedisConfig)(),
        prefix: env_1.env.QUEUE_PREFIX,
        concurrency: 4,
    });
    worker.on('completed', job => {
        logger_1.logger.info('worker_job_completed', { jobId: job.id, name: job.name });
    });
    worker.on('failed', async (job, error) => {
        logger_1.logger.error('worker_job_failed', {
            jobId: job?.id,
            name: job?.name,
            error: error.message,
        });
        if (job) {
            await upsertJobStatus(job, 'FAILED', { error: error.message });
        }
    });
    worker.on('error', error => {
        logger_1.logger.error('worker_error', { error: error.message });
    });
    return worker;
}
if (require.main === module) {
    startAnalysisWorker();
    logger_1.logger.info('analysis_worker_started', { queue: env_1.env.QUEUE_NAME });
}
//# sourceMappingURL=analysisWorker.js.map
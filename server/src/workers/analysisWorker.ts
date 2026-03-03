import { Job, Worker } from 'bullmq';
import { aiService } from '../ai/aiService';
import { env } from '../config/env';
import { query } from '../config/database';
import { getRedisConfig } from '../config/redis';
import { logger } from '../config/logger';
import { JobType } from '../types';
import { malwareAnalysisService } from '../services/malwareAnalysisService';
import { threatIntelService } from '../services/threatIntelService';

async function upsertJobStatus(
  job: Job,
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED',
  details?: Record<string, unknown>,
) {
  const isFinal = status === 'COMPLETED' || status === 'FAILED';
  const completedAt = isFinal ? new Date() : null;

  await query(
    `
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
    `,
    [
      job.id ?? 'unknown-job',
      job.name,
      status,
      JSON.stringify(details ?? {}),
      completedAt,
    ],
  );
}

async function processAISummarization(job: Job<{ targetType: 'incident' | 'malware' | 'threat'; targetId: string; content: string }>) {
  if (job.data.targetType === 'incident') {
    const summary = await aiService.summarizeIncident(job.data.content);
    await query(
      `
        INSERT INTO incident_events (incident_id, event_type, description, metadata)
        VALUES ($1, 'AI_SUMMARY', 'AI-generated incident summary created', $2::jsonb)
      `,
      [job.data.targetId, JSON.stringify(summary)],
    );
    return summary;
  }

  if (job.data.targetType === 'malware') {
    const report = await aiService.generateExecutiveReport(job.data.content);
    await query(
      `
        UPDATE malware_reports
        SET executive_summary = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [job.data.targetId, JSON.stringify(report)],
    );
    return report;
  }

  const classification = await aiService.classifyThreat(job.data.content);
  await query(
    `
      INSERT INTO logs (source, log_type, severity, message, raw_data, event_timestamp)
      VALUES ('worker', 'ai_threat_classification', 'INFO', 'AI threat classification generated', $1::jsonb, NOW())
    `,
    [JSON.stringify({ targetId: job.data.targetId, classification })],
  );

  return classification;
}

async function processThreatClassification(job: Job<{ logId: string; source: string; message: string; rawData: Record<string, unknown> }>) {
  const indicators = await threatIntelService.processLogIndicators({
    message: job.data.message,
    rawData: job.data.rawData,
  });

  const classification = await aiService.classifyThreat({
    logId: job.data.logId,
    message: job.data.message,
    rawData: job.data.rawData,
    indicators,
  });

  await query(
    `
      INSERT INTO logs (source, log_type, severity, message, raw_data, event_timestamp)
      VALUES ('worker', 'threat_classification', 'INFO', 'Threat classification completed', $1::jsonb, NOW())
    `,
    [JSON.stringify({ logId: job.data.logId, classification, indicatorCount: indicators.length })],
  );

  return {
    indicators: indicators.length,
    classification,
  };
}

export function startAnalysisWorker() {
  const worker = new Worker(
    env.QUEUE_NAME,
    async job => {
      await upsertJobStatus(job, 'PROCESSING');

      if (job.name === JobType.MALWARE_ANALYSIS) {
        await malwareAnalysisService.processMalwareAnalysisJob(job.data as {
          reportId: string;
          filePath: string;
          originalName: string;
          mimeType: string;
          uploadedBy: string;
        });

        await upsertJobStatus(job, 'COMPLETED', { type: JobType.MALWARE_ANALYSIS });
        return { ok: true };
      }

      if (job.name === JobType.AI_SUMMARIZATION) {
        const details = await processAISummarization(job as Job<any>);
        await upsertJobStatus(job, 'COMPLETED', { type: JobType.AI_SUMMARIZATION, details });
        return details;
      }

      if (job.name === JobType.THREAT_CLASSIFICATION) {
        const details = await processThreatClassification(job as Job<any>);
        await upsertJobStatus(job, 'COMPLETED', { type: JobType.THREAT_CLASSIFICATION, details });
        return details;
      }

      throw new Error(`Unsupported job type: ${job.name}`);
    },
    {
      connection: getRedisConfig(),
      prefix: env.QUEUE_PREFIX,
      concurrency: 4,
    },
  );

  worker.on('completed', job => {
    logger.info('worker_job_completed', { jobId: job.id, name: job.name });
  });

  worker.on('failed', async (job, error) => {
    logger.error('worker_job_failed', {
      jobId: job?.id,
      name: job?.name,
      error: error.message,
    });

    if (job) {
      await upsertJobStatus(job, 'FAILED', { error: error.message });
    }
  });

  worker.on('error', error => {
    logger.error('worker_error', { error: error.message });
  });

  return worker;
}

if (require.main === module) {
  startAnalysisWorker();
  logger.info('analysis_worker_started', { queue: env.QUEUE_NAME });
}

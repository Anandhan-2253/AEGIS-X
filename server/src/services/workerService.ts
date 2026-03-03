import { JobType, MalwareAnalysisJobData, ThreatClassificationJobData, QueueHealth } from '../types';
import { addAnalysisJob, getQueueHealth } from '../config/queue';

class WorkerService {
  async enqueueMalwareAnalysis(payload: MalwareAnalysisJobData): Promise<string> {
    const job = await addAnalysisJob(JobType.MALWARE_ANALYSIS, payload);
    return job.id ?? 'unknown-job';
  }

  async enqueueThreatClassification(payload: ThreatClassificationJobData): Promise<string> {
    const job = await addAnalysisJob(JobType.THREAT_CLASSIFICATION, payload);
    return job.id ?? 'unknown-job';
  }

  async enqueueAISummarization(payload: {
    targetType: 'incident' | 'malware' | 'threat';
    targetId: string;
    content: string;
  }): Promise<string> {
    const job = await addAnalysisJob(JobType.AI_SUMMARIZATION, payload);
    return job.id ?? 'unknown-job';
  }

  async getStatus(): Promise<QueueHealth> {
    const counts = await getQueueHealth();
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  }
}

export const workerService = new WorkerService();

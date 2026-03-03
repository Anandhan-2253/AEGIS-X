import { Job, Queue, QueueEvents } from 'bullmq';
import { env } from './env';
import { getRedisConfig } from './redis';
import { JobType } from '../types';

const isTest = env.NODE_ENV === 'test';

export const analysisQueue = isTest
  ? null
  : new Queue(env.QUEUE_NAME, {
      connection: getRedisConfig(),
      prefix: env.QUEUE_PREFIX,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 500,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

export const analysisQueueEvents = isTest
  ? null
  : new QueueEvents(env.QUEUE_NAME, {
      connection: getRedisConfig(),
      prefix: env.QUEUE_PREFIX,
    });

export async function addAnalysisJob<T>(name: JobType, payload: T): Promise<Job<T>> {
  if (isTest || !analysisQueue) {
    return { id: `${name}:test` } as Job<T>;
  }

  return analysisQueue.add(name, payload, {
    jobId: `${name}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
  });
}

export async function getQueueHealth() {
  if (isTest || !analysisQueue) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }

  return analysisQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
}

export async function closeQueue(): Promise<void> {
  if (!analysisQueue || !analysisQueueEvents) return;
  await Promise.all([analysisQueue.close(), analysisQueueEvents.close()]);
}

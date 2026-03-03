"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisQueueEvents = exports.analysisQueue = void 0;
exports.addAnalysisJob = addAnalysisJob;
exports.getQueueHealth = getQueueHealth;
exports.closeQueue = closeQueue;
const bullmq_1 = require("bullmq");
const env_1 = require("./env");
const redis_1 = require("./redis");
const isTest = env_1.env.NODE_ENV === 'test';
exports.analysisQueue = isTest
    ? null
    : new bullmq_1.Queue(env_1.env.QUEUE_NAME, {
        connection: (0, redis_1.getRedisConfig)(),
        prefix: env_1.env.QUEUE_PREFIX,
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
exports.analysisQueueEvents = isTest
    ? null
    : new bullmq_1.QueueEvents(env_1.env.QUEUE_NAME, {
        connection: (0, redis_1.getRedisConfig)(),
        prefix: env_1.env.QUEUE_PREFIX,
    });
async function addAnalysisJob(name, payload) {
    if (isTest || !exports.analysisQueue) {
        return { id: `${name}:test` };
    }
    return exports.analysisQueue.add(name, payload, {
        jobId: `${name}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    });
}
async function getQueueHealth() {
    if (isTest || !exports.analysisQueue) {
        return {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
        };
    }
    return exports.analysisQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
}
async function closeQueue() {
    if (!exports.analysisQueue || !exports.analysisQueueEvents)
        return;
    await Promise.all([exports.analysisQueue.close(), exports.analysisQueueEvents.close()]);
}
//# sourceMappingURL=queue.js.map
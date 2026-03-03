import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const isTest = env.NODE_ENV === 'test';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null as null,
};

const redisStub = {
  ping: async () => 'PONG',
  quit: async () => undefined,
  on: () => undefined,
};

export const redis = isTest ? (redisStub as unknown as Redis) : new Redis(redisConfig);
export const redisSubscriber = isTest ? (redisStub as unknown as Redis) : new Redis(redisConfig);

if (!isTest) {
  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', (error: Error) => logger.error('Redis error', { error: error.message }));
}

export const getRedisConfig = () => ({ ...redisConfig });

export async function testRedis(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  await Promise.all([redis.quit(), redisSubscriber.quit()]);
}

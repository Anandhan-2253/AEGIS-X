import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? (process.env.JEST_WORKER_ID ? 'test' : 'development'),
  PORT: toInt(process.env.PORT, 5000),
  API_VERSION: process.env.API_VERSION ?? 'v1',

  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: toInt(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME ?? 'aegisx',
  DB_USER: process.env.DB_USER ?? 'aegisx_user',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',

  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: toInt(process.env.REDIS_PORT, 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? '',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? '7d',

  UPLOAD_DIR: process.env.UPLOAD_DIR ?? path.resolve(__dirname, '../../temp_uploads'),
  MAX_FILE_SIZE: toInt(process.env.MAX_FILE_SIZE, 50 * 1024 * 1024),

  AI_SERVICE_URL: process.env.AI_SERVICE_URL ?? 'http://localhost:8080',
  AI_MODEL: process.env.AI_MODEL ?? 'llama2',
  AI_MAX_TOKENS: toInt(process.env.AI_MAX_TOKENS, 2048),
  AI_REQUEST_TIMEOUT_MS: toInt(process.env.AI_REQUEST_TIMEOUT_MS, 30000),

  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN ?? 'http://localhost:5173',

  RATE_LIMIT_WINDOW_MS: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: toInt(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
  AUTH_RATE_LIMIT_MAX: toInt(process.env.AUTH_RATE_LIMIT_MAX, 20),

  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  LOG_DIR: process.env.LOG_DIR ?? path.resolve(__dirname, '../../logs'),

  QUEUE_NAME: process.env.QUEUE_NAME ?? 'aegis_analysis',
  QUEUE_PREFIX: process.env.QUEUE_PREFIX ?? 'aegisx',
};

export const isProduction = env.NODE_ENV === 'production';

export function assertSecureRuntime(): void {
  if (!isProduction) return;

  const weakSecrets = [
    'dev_access_secret_change_me',
    'dev_refresh_secret_change_me',
    'INSECURE_DEV_ACCESS_SECRET',
    'INSECURE_DEV_REFRESH_SECRET',
  ];

  if (weakSecrets.includes(env.JWT_ACCESS_SECRET) || weakSecrets.includes(env.JWT_REFRESH_SECRET)) {
    throw new Error('JWT secrets must be set to strong values in production mode.');
  }
}

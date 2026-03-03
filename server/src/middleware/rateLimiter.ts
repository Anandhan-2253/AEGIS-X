import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const commonConfig = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const apiLimiter = rateLimit({
  ...commonConfig,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, error: 'Too many requests. Slow down and retry.' },
});

export const authLimiter = rateLimit({
  ...commonConfig,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: { success: false, error: 'Too many authentication attempts.' },
});

export const uploadLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Upload quota exceeded for this hour.' },
});

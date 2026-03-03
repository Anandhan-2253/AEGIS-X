import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { env } from './env';

const logDir = path.resolve(env.LOG_DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const loggerTransports: winston.transport[] = [
  new winston.transports.Console({
    format: env.NODE_ENV === 'production'
      ? jsonFormat
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const tail = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${level} ${message}${tail}`;
          }),
        ),
  }),
];

if (env.NODE_ENV !== 'test') {
  loggerTransports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'application.log'),
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'aegis-x-server' },
  transports: loggerTransports,
});

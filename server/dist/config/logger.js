"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const logDir = path_1.default.resolve(env_1.env.LOG_DIR);
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const jsonFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const loggerTransports = [
    new winston_1.default.transports.Console({
        format: env_1.env.NODE_ENV === 'production'
            ? jsonFormat
            : winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
                const tail = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level} ${message}${tail}`;
            })),
    }),
];
if (env_1.env.NODE_ENV !== 'test') {
    loggerTransports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'application.log'),
        format: jsonFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 10,
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
        format: jsonFormat,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 10,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    defaultMeta: { service: 'aegis-x-server' },
    transports: loggerTransports,
});
//# sourceMappingURL=logger.js.map
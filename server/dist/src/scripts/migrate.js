"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
async function migrate() {
    const migrationDir = path_1.default.resolve(__dirname, '../../db/migrations');
    const files = fs_1.default.readdirSync(migrationDir).filter(name => name.endsWith('.sql')).sort();
    for (const file of files) {
        const fullPath = path_1.default.join(migrationDir, file);
        const sql = fs_1.default.readFileSync(fullPath, 'utf8');
        logger_1.logger.info('migration_start', { file });
        await (0, database_1.query)(sql);
        logger_1.logger.info('migration_success', { file });
    }
    logger_1.logger.info('migration_completed', { count: files.length });
}
void migrate()
    .catch(error => {
    logger_1.logger.error('migration_failed', {
        error: error instanceof Error ? error.message : 'unknown',
    });
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, database_1.closeDatabase)();
});
//# sourceMappingURL=migrate.js.map
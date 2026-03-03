import fs from 'fs';
import path from 'path';
import { closeDatabase, query } from '../config/database';
import { logger } from '../config/logger';

async function migrate() {
  const migrationDir = path.resolve(__dirname, '../../db/migrations');
  const files = fs.readdirSync(migrationDir).filter(name => name.endsWith('.sql')).sort();

  for (const file of files) {
    const fullPath = path.join(migrationDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');

    logger.info('migration_start', { file });
    await query(sql);
    logger.info('migration_success', { file });
  }

  logger.info('migration_completed', { count: files.length });
}

void migrate()
  .catch(error => {
    logger.error('migration_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });

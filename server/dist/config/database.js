"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.withTransaction = withTransaction;
exports.testDatabase = testDatabase;
exports.closeDatabase = closeDatabase;
const pg_1 = require("pg");
const env_1 = require("./env");
const logger_1 = require("./logger");
const pool = new pg_1.Pool({
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    database: env_1.env.DB_NAME,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
pool.on('error', (error) => {
    logger_1.logger.error('Unexpected database pool error', { error: error.message });
});
async function query(text, params = []) {
    return pool.query(text, params);
}
async function withTransaction(work) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
async function testDatabase() {
    try {
        await query('SELECT 1');
        return true;
    }
    catch {
        return false;
    }
}
async function closeDatabase() {
    await pool.end();
}
//# sourceMappingURL=database.js.map
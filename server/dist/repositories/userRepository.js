"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
exports.updateUserStatus = updateUserStatus;
const database_1 = require("../config/database");
function mapSafeUser(row) {
    return {
        id: row.id,
        email: row.email,
        username: row.username,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at.toISOString(),
    };
}
async function createUser(params) {
    const result = await (0, database_1.query)(`
      INSERT INTO users (email, username, password_hash, role_id)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE code = $4))
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `, [params.email.toLowerCase(), params.username, params.passwordHash, params.role]);
    return mapSafeUser(result.rows[0]);
}
async function findUserByEmail(email) {
    const result = await (0, database_1.query)(`
      SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
        r.code::text AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1 AND u.deleted_at IS NULL
      LIMIT 1
    `, [email.toLowerCase()]);
    return result.rows[0] ?? null;
}
async function findUserById(userId) {
    const result = await (0, database_1.query)(`
      SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
        r.code::text AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      LIMIT 1
    `, [userId]);
    return result.rows[0] ?? null;
}
async function listUsers(page, limit) {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
        (0, database_1.query)(`
        SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
          r.code::text AS role
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.deleted_at IS NULL
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
        (0, database_1.query)('SELECT COUNT(*)::text AS count FROM users WHERE deleted_at IS NULL'),
    ]);
    return {
        users: dataResult.rows.map(mapSafeUser),
        total: Number.parseInt(countResult.rows[0].count, 10),
    };
}
async function updateUserRole(userId, role) {
    const result = await (0, database_1.query)(`
      UPDATE users
      SET role_id = (SELECT id FROM roles WHERE code = $2), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `, [userId, role]);
    return result.rows[0] ? mapSafeUser(result.rows[0]) : null;
}
async function updateUserStatus(userId, isActive) {
    const result = await (0, database_1.query)(`
      UPDATE users
      SET is_active = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `, [userId, isActive]);
    return result.rows[0] ? mapSafeUser(result.rows[0]) : null;
}
//# sourceMappingURL=userRepository.js.map
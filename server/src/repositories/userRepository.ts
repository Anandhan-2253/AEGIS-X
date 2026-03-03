import { query } from '../config/database';
import { SafeUser, UserRole } from '../types';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

function mapSafeUser(row: UserRecord): SafeUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createUser(params: {
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
}): Promise<SafeUser> {
  const result = await query<UserRecord>(
    `
      INSERT INTO users (email, username, password_hash, role_id)
      VALUES ($1, $2, $3, (SELECT id FROM roles WHERE code = $4))
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `,
    [params.email.toLowerCase(), params.username, params.passwordHash, params.role],
  );

  return mapSafeUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await query<UserRecord>(
    `
      SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
        r.code::text AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1 AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [email.toLowerCase()],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(userId: string): Promise<UserRecord | null> {
  const result = await query<UserRecord>(
    `
      SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
        r.code::text AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function listUsers(page: number, limit: number): Promise<{ users: SafeUser[]; total: number }> {
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    query<UserRecord>(
      `
        SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.created_at,
          r.code::text AS role
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        WHERE u.deleted_at IS NULL
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ),
    query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users WHERE deleted_at IS NULL'),
  ]);

  return {
    users: dataResult.rows.map(mapSafeUser),
    total: Number.parseInt(countResult.rows[0].count, 10),
  };
}

export async function updateUserRole(userId: string, role: UserRole): Promise<SafeUser | null> {
  const result = await query<UserRecord>(
    `
      UPDATE users
      SET role_id = (SELECT id FROM roles WHERE code = $2), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `,
    [userId, role],
  );

  return result.rows[0] ? mapSafeUser(result.rows[0]) : null;
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<SafeUser | null> {
  const result = await query<UserRecord>(
    `
      UPDATE users
      SET is_active = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, email, username, password_hash, is_active, created_at,
      (SELECT code::text FROM roles WHERE id = users.role_id) AS role
    `,
    [userId, isActive],
  );

  return result.rows[0] ? mapSafeUser(result.rows[0]) : null;
}

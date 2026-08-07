import { pool } from '../config/db.js';

const userColumns = `
  id,
  name,
  email,
  role,
  is_active,
  token_version,
  last_login_at,
  created_at,
  updated_at
`;

export async function findUserByEmail(email, includePassword = false) {
  const [rows] = await pool.execute(
    `SELECT ${includePassword ? `${userColumns}, password_hash` : userColumns}
     FROM admin_users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT ${userColumns}
     FROM admin_users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
}

export async function createAdminUser({ name, email, passwordHash, role }) {
  const [result] = await pool.execute(
    `INSERT INTO admin_users (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [name, email, passwordHash, role],
  );

  return findUserById(result.insertId);
}

export async function updateLastLogin(userId) {
  await pool.execute(
    'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
    [userId],
  );
}

export async function rotateTokenVersion(userId) {
  await pool.execute(
    'UPDATE admin_users SET token_version = token_version + 1 WHERE id = ?',
    [userId],
  );

  return findUserById(userId);
}

export async function savePasswordResetToken(userId, tokenHash, expiresAt) {
  await pool.execute(
    `UPDATE admin_users
     SET password_reset_token_hash = ?, password_reset_expires_at = ?
     WHERE id = ?`,
    [tokenHash, expiresAt, userId],
  );
}

export async function findUserByResetTokenHash(tokenHash) {
  const [rows] = await pool.execute(
    `SELECT ${userColumns}, password_reset_expires_at
     FROM admin_users
     WHERE password_reset_token_hash = ?
       AND password_reset_expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash],
  );

  return rows[0] || null;
}

export async function updatePassword(userId, passwordHash) {
  await pool.execute(
    `UPDATE admin_users
     SET password_hash = ?,
         password_reset_token_hash = NULL,
         password_reset_expires_at = NULL,
         token_version = token_version + 1
     WHERE id = ?`,
    [passwordHash, userId],
  );
}

import { pool } from '../config/db.js';

export async function createActivityLog({
    adminId = null,
    action,
    entityType = null,
    entityId = null,
    description = null,
    metadata = null,
}) {
    const [result] = await pool.execute(
        `INSERT INTO activity_logs (
      admin_user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            adminId,
            action,
            entityType,
            entityId,
            description,
            metadata ? JSON.stringify(metadata) : null,
        ],
    );

    return result.insertId;
}

export async function findRecentActivity(limit = 8) {
    const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 50);
    const [rows] = await pool.execute(
        `SELECT
          al.id,
          al.action,
          al.entity_type AS entityType,
          al.entity_id AS entityId,
          al.description,
          al.metadata,
          al.created_at AS createdAt,
          au.name AS adminName,
          au.email AS adminEmail
        FROM activity_logs al
        LEFT JOIN admin_users au ON au.id = al.admin_user_id
        ORDER BY al.created_at DESC
        LIMIT ${safeLimit}`,
    );

    return rows;
}

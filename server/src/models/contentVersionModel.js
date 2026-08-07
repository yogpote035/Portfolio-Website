import { pool } from '../config/db.js';

export async function createContentVersion({ entityType, entityId, snapshot, summary, createdBy }) {
    const [[current]] = await pool.execute(
        `SELECT COALESCE(MAX(version_number), 0) AS versionNumber
         FROM content_versions
         WHERE entity_type = ? AND entity_id = ?`,
        [entityType, entityId],
    );
    const versionNumber = Number(current?.versionNumber || 0) + 1;
    const [result] = await pool.execute(
        `INSERT INTO content_versions (entity_type, entity_id, version_number, snapshot, summary, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entityType, entityId, versionNumber, JSON.stringify(snapshot), summary || null, createdBy || null],
    );
    return findContentVersionById(result.insertId);
}

export async function findContentVersions(entityType, entityId) {
    const [rows] = await pool.execute(
        `SELECT id, entity_type AS entityType, entity_id AS entityId, version_number AS versionNumber,
                summary, created_by AS createdBy, created_at AS createdAt
         FROM content_versions
         WHERE entity_type = ? AND entity_id = ?
         ORDER BY version_number DESC`,
        [entityType, entityId],
    );
    return rows;
}

export async function findContentVersionById(id) {
    const [rows] = await pool.execute(
        `SELECT id, entity_type AS entityType, entity_id AS entityId, version_number AS versionNumber,
                snapshot, summary, created_by AS createdBy, created_at AS createdAt
         FROM content_versions WHERE id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

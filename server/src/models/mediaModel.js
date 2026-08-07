import { pool } from '../config/db.js';

export async function createMedia(mediaData) {
    const [result] = await pool.execute(
        `INSERT INTO media (
      file_name,
      original_name,
      mime_type,
      size_bytes,
      storage_provider,
      url,
      public_id,
      folder,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            mediaData.file_name,
            mediaData.original_name,
            mediaData.mime_type,
            mediaData.size_bytes,
            mediaData.storage_provider,
            mediaData.url,
            mediaData.public_id,
            mediaData.folder || null,
            mediaData.created_by || null,
        ],
    );

    const [rows] = await pool.execute(`SELECT * FROM media WHERE id = ? LIMIT 1`, [result.insertId]);
    return rows[0] || null;
}

export async function findMedia({ page = 1, limit = 24, folder, provider, search } = {}) {
    const whereClauses = [];
    const params = [];

    if (folder) {
        whereClauses.push('folder = ?');
        params.push(folder);
    }

    if (provider) {
        whereClauses.push('storage_provider = ?');
        params.push(provider);
    }

    if (search) {
        whereClauses.push('(original_name LIKE ? OR file_name LIKE ? OR folder LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 24, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await pool.execute(
        `SELECT *
     FROM media
     ${whereSql}
     ORDER BY created_at DESC, id DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
        params,
    );

    const [[{ count }]] = await pool.execute(
        `SELECT COUNT(*) AS count
     FROM media
     ${whereSql}`,
        params,
    );

    return { rows, count: Number(count), page: safePage, limit: safeLimit };
}

export async function findMediaById(id) {
    const [rows] = await pool.execute(
        `SELECT * FROM media WHERE id = ? LIMIT 1`,
        [id],
    );

    return rows[0] || null;
}

export async function updateMediaById(id, mediaData) {
    await pool.execute(
        `UPDATE media SET
      file_name = ?,
      original_name = ?,
      mime_type = ?,
      size_bytes = ?,
      storage_provider = ?,
      url = ?,
      public_id = ?,
      folder = ?
     WHERE id = ?`,
        [
            mediaData.file_name,
            mediaData.original_name,
            mediaData.mime_type,
            mediaData.size_bytes,
            mediaData.storage_provider,
            mediaData.url,
            mediaData.public_id,
            mediaData.folder || null,
            id,
        ],
    );

    return findMediaById(id);
}

export async function deleteMediaById(id) {
    const [result] = await pool.execute(`DELETE FROM media WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

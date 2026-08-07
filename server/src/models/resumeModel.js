import { pool } from '../config/db.js';

export async function createResume(resumeData) {
    const [result] = await pool.execute(
        `INSERT INTO resumes (
      original_name,
      storage_path,
      file_url,
      mime_type,
      file_size,
      version,
      is_active,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            resumeData.original_name,
            resumeData.storage_path,
            resumeData.file_url,
            resumeData.mime_type,
            resumeData.file_size,
            resumeData.version || 1,
            resumeData.is_active ? 1 : 0,
            resumeData.created_by || null,
        ],
    );

    return findResumeById(result.insertId);
}

export async function createActiveResume(resumeData) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(`UPDATE resumes SET is_active = 0 WHERE is_active = 1`);

        const [[{ nextVersion }]] = await connection.execute(
            `SELECT COALESCE(MAX(version), 0) + 1 AS nextVersion FROM resumes`,
        );

        const [result] = await connection.execute(
            `INSERT INTO resumes (
        original_name,
        storage_path,
        file_url,
        mime_type,
        file_size,
        version,
        is_active,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
            [
                resumeData.original_name,
                resumeData.storage_path,
                resumeData.file_url,
                resumeData.mime_type,
                resumeData.file_size,
                resumeData.version || nextVersion || 1,
                resumeData.created_by || null,
            ],
        );

        await connection.commit();
        return findResumeById(result.insertId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function findResumes({ page = 1, limit = 20, search, activeOnly = false }) {
    const whereClauses = [];
    const params = [];

    if (activeOnly) {
        whereClauses.push('is_active = 1');
    }

    if (search) {
        whereClauses.push('original_name LIKE ?');
        params.push(`%${search}%`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const limitValue = Number(limit) || 20;
    const offsetValue = Math.max(0, (Number(page) - 1) * limitValue);

    const [rows] = await pool.execute(
        `SELECT * FROM resumes ${whereSql} ORDER BY is_active DESC, version DESC, created_at DESC LIMIT ${limitValue} OFFSET ${offsetValue}`,
        params,
    );

    const [[{ count }]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM resumes ${whereSql}`,
        params,
    );

    return { rows, count: Number(count) };
}

export async function findResumeById(id) {
    const [rows] = await pool.execute(
        `SELECT * FROM resumes WHERE id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

export async function findActiveResume() {
    const [rows] = await pool.execute(
        `SELECT * FROM resumes WHERE is_active = 1 ORDER BY version DESC, created_at DESC LIMIT 1`,
    );
    return rows[0] || null;
}

export async function deactivateAllResumes() {
    await pool.execute(`UPDATE resumes SET is_active = 0 WHERE is_active = 1`);
}

export async function activateResumeById(id) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT id FROM resumes WHERE id = ? LIMIT 1`,
            [id],
        );

        if (!rows[0]) {
            await connection.rollback();
            return null;
        }

        await connection.execute(`UPDATE resumes SET is_active = 0 WHERE is_active = 1`);
        await connection.execute(
            `UPDATE resumes SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [id],
        );

        await connection.commit();
        return findResumeById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateResumeById(id, resumeData) {
    const originalName = resumeData.original_name ?? null;
    const version = resumeData.version ?? null;
    const isActive = resumeData.is_active === undefined ? null : resumeData.is_active ? 1 : 0;

    await pool.execute(
        `UPDATE resumes SET
      original_name = COALESCE(NULLIF(?, ''), original_name),
      version = COALESCE(?, version),
      is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        [originalName, version, isActive, id],
    );

    return findResumeById(id);
}

export async function deleteResumeById(id) {
    const [result] = await pool.execute(`DELETE FROM resumes WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

export async function incrementResumeDownloadCount(id) {
    await pool.execute(`UPDATE resumes SET download_count = download_count + 1 WHERE id = ?`, [id]);
}

export async function findLatestResume() {
    const [rows] = await pool.execute(
        `SELECT * FROM resumes ORDER BY created_at DESC LIMIT 1`,
    );
    return rows[0] || null;
}

import { pool } from '../config/db.js';

export async function findExperiences() {
    const [rows] = await pool.execute(
        `SELECT e.*, m.url AS company_logo_url, m.public_id AS company_logo_public_id
     FROM experiences e
     LEFT JOIN media m ON e.company_logo_media_id = m.id
     ORDER BY e.display_order ASC, e.start_date DESC, e.id ASC`,
    );
    return rows;
}

export async function findExperienceById(id) {
    const [rows] = await pool.execute(
        `SELECT e.*, m.url AS company_logo_url, m.public_id AS company_logo_public_id
     FROM experiences e
     LEFT JOIN media m ON e.company_logo_media_id = m.id
     WHERE e.id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

export async function createExperience(experienceData) {
    const [result] = await pool.execute(
        `INSERT INTO experiences (
      company,
      company_logo_media_id,
      job_title,
      employment_type,
      start_date,
      end_date,
      current_company,
      location,
      description,
      responsibilities,
      technologies,
      display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            experienceData.company,
            experienceData.company_logo_media_id || null,
            experienceData.job_title,
            experienceData.employment_type || null,
            experienceData.start_date,
            experienceData.end_date || null,
            experienceData.current_company ?? false,
            experienceData.location || null,
            experienceData.description || null,
            JSON.stringify(experienceData.responsibilities || []),
            JSON.stringify(experienceData.technologies || []),
            experienceData.display_order || 1,
        ],
    );

    return findExperienceById(result.insertId);
}

export async function updateExperienceById(id, experienceData) {
    await pool.execute(
        `UPDATE experiences SET
      company = ?,
      company_logo_media_id = ?,
      job_title = ?,
      employment_type = ?,
      start_date = ?,
      end_date = ?,
      current_company = ?,
      location = ?,
      description = ?,
      responsibilities = ?,
      technologies = ?,
      display_order = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        [
            experienceData.company,
            experienceData.company_logo_media_id || null,
            experienceData.job_title,
            experienceData.employment_type || null,
            experienceData.start_date,
            experienceData.end_date || null,
            experienceData.current_company ?? false,
            experienceData.location || null,
            experienceData.description || null,
            JSON.stringify(experienceData.responsibilities || []),
            JSON.stringify(experienceData.technologies || []),
            experienceData.display_order || 1,
            id,
        ],
    );

    return findExperienceById(id);
}

export async function deleteExperienceById(id) {
    const [result] = await pool.execute(
        `DELETE FROM experiences WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

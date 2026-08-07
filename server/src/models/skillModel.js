import { pool } from '../config/db.js';

export async function findSkills(includeInactive = false) {
    const condition = includeInactive ? '' : 'WHERE s.is_active = TRUE';
    const [rows] = await pool.execute(
        `SELECT s.*, m.url AS logo_media_url, m.public_id AS logo_media_public_id
     FROM skills s
     LEFT JOIN media m ON s.logo_media_id = m.id
     ${condition}
     ORDER BY s.display_order ASC, s.id ASC`,
    );
    return rows;
}

export async function findSkillById(id) {
    const [rows] = await pool.execute(
        `SELECT s.*, m.url AS logo_media_url, m.public_id AS logo_media_public_id
     FROM skills s
     LEFT JOIN media m ON s.logo_media_id = m.id
     WHERE s.id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

export async function createSkill(skillData) {
    const [result] = await pool.execute(
        `INSERT INTO skills (name, category, logo_media_id, color, level, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            skillData.name,
            skillData.category,
            skillData.logo_media_id || null,
            skillData.color || null,
            skillData.level || null,
            skillData.display_order || 1,
            skillData.is_active ?? true,
        ],
    );

    return findSkillById(result.insertId);
}

export async function updateSkillById(id, skillData) {
    await pool.execute(
        `UPDATE skills SET
      name = ?,
      category = ?,
      logo_media_id = ?,
      color = ?,
      level = ?,
      display_order = ?,
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        [
            skillData.name,
            skillData.category,
            skillData.logo_media_id || null,
            skillData.color || null,
            skillData.level || null,
            skillData.display_order || 1,
            skillData.is_active ?? true,
            id,
        ],
    );

    return findSkillById(id);
}

export async function deleteSkillById(id) {
    const [result] = await pool.execute(
        `DELETE FROM skills WHERE id = ?`,
        [id],
    );

    return result.affectedRows > 0;
}

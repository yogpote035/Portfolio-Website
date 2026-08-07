import { pool } from '../config/db.js';

export async function findEducationEntries() {
    const [rows] = await pool.execute(
        `SELECT * FROM education ORDER BY display_order ASC, start_date DESC, id ASC`,
    );
    return rows;
}

export async function findEducationById(id) {
    const [rows] = await pool.execute(
        `SELECT * FROM education WHERE id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

export async function createEducationEntry(data) {
    const [result] = await pool.execute(
        `INSERT INTO education (
      degree,
      college,
      university,
      cgpa,
      percentage,
      start_date,
      end_date,
      description,
      coursework,
      display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.degree,
            data.college,
            data.university || null,
            data.cgpa || null,
            data.percentage || null,
            data.start_date || null,
            data.end_date || null,
            data.description || null,
            JSON.stringify(data.coursework || []),
            data.display_order || 1,
        ],
    );

    return findEducationById(result.insertId);
}

export async function updateEducationById(id, data) {
    await pool.execute(
        `UPDATE education SET
      degree = ?,
      college = ?,
      university = ?,
      cgpa = ?,
      percentage = ?,
      start_date = ?,
      end_date = ?,
      description = ?,
      coursework = ?,
      display_order = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        [
            data.degree,
            data.college,
            data.university || null,
            data.cgpa || null,
            data.percentage || null,
            data.start_date || null,
            data.end_date || null,
            data.description || null,
            JSON.stringify(data.coursework || []),
            data.display_order || 1,
            id,
        ],
    );

    return findEducationById(id);
}

export async function deleteEducationById(id) {
    const [result] = await pool.execute(
        `DELETE FROM education WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

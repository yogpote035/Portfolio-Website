import { pool } from '../config/db.js';

export async function findSkillCategories(includeInactive = false) {
  const where = includeInactive ? '' : 'WHERE is_active = TRUE';
  const [rows] = await pool.execute(`SELECT * FROM skill_categories ${where} ORDER BY display_order ASC, name ASC`);
  return rows;
}

export async function createSkillCategory({ slug, name, icon = 'bx-star', display_order = 1 }) {
  const [result] = await pool.execute(
    'INSERT INTO skill_categories (slug, name, icon, display_order) VALUES (?, ?, ?, ?)',
    [slug, name, icon, display_order],
  );
  const [rows] = await pool.execute('SELECT * FROM skill_categories WHERE id = ?', [result.insertId]);
  return rows[0];
}

export async function updateSkillCategory(id, data) {
  await pool.execute(
    'UPDATE skill_categories SET slug = ?, name = ?, icon = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [data.slug, data.name, data.icon || 'bx-star', data.display_order ?? 1, data.is_active ?? true, id],
  );
  const [rows] = await pool.execute('SELECT * FROM skill_categories WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function deleteSkillCategory(id) {
  const [rows] = await pool.execute('SELECT slug FROM skill_categories WHERE id = ?', [id]);
  if (!rows[0]) return false;
  const [usage] = await pool.execute('SELECT COUNT(*) AS count FROM skills WHERE category = ?', [rows[0].slug]);
  if (Number(usage[0]?.count) > 0) {
    const error = new Error('Move or delete the skills in this category before deleting it.');
    error.statusCode = 409;
    error.code = 'CATEGORY_IN_USE';
    throw error;
  }
  const [result] = await pool.execute('DELETE FROM skill_categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

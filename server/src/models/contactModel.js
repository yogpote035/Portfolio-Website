import { pool } from '../config/db.js';

export async function createContact(contactData) {
    const [result] = await pool.execute(
        `INSERT INTO contacts (
      name,
      email,
      phone,
      company,
      subject,
      message
    ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            contactData.name,
            contactData.email,
            contactData.phone || null,
            contactData.company || null,
            contactData.subject,
            contactData.message,
        ],
    );

    const [rows] = await pool.execute(`SELECT * FROM contacts WHERE id = ? LIMIT 1`, [result.insertId]);
    return rows[0] || null;
}

export async function findContacts({ status, starred, search, page, limit }) {
    const whereClauses = [];
    const params = [];

    if (status) {
        whereClauses.push('status = ?');
        params.push(status);
    }

    if (starred !== undefined) {
        whereClauses.push('is_starred = ?');
        params.push(starred ? 1 : 0);
    }

    if (search) {
        whereClauses.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR subject LIKE ? OR message LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const offset = (safePage - 1) * safeLimit;
    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await pool.execute(
        `SELECT * FROM contacts ${whereSql} ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`,
        params,
    );

    const [[{ count }]] = await pool.execute(
        `SELECT COUNT(*) AS count FROM contacts ${whereSql}`,
        params,
    );

    return { rows, count: Number(count) };
}

export async function findContactById(id) {
    const [rows] = await pool.execute(
        `SELECT * FROM contacts WHERE id = ? LIMIT 1`,
        [id],
    );
    return rows[0] || null;
}

export async function updateContactById(id, contactData) {
    const baseValues = [
        contactData.name,
        contactData.email,
        contactData.phone || null,
        contactData.company || null,
        contactData.subject,
        contactData.message,
    ];

    try {
        await pool.execute(
            `UPDATE contacts SET
      name = ?,
      email = ?,
      phone = ?,
      company = ?,
      subject = ?,
      message = ?,
      status = ?,
      is_starred = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
            [...baseValues, contactData.status || 'unread', contactData.is_starred ? 1 : 0, id],
        );
    } catch (error) {
        if (error?.code === 'ER_BAD_FIELD_ERROR' && /status|is_starred/.test(error.message)) {
            await pool.execute(
                `UPDATE contacts SET
      name = ?,
      email = ?,
      phone = ?,
      company = ?,
      subject = ?,
      message = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
                [...baseValues, id],
            );
        } else {
            throw error;
        }
    }

    return findContactById(id);
}

export async function deleteContactById(id) {
    const [result] = await pool.execute(`DELETE FROM contacts WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

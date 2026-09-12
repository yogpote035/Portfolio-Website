import { pool } from '../config/db.js';

export async function findProfile() {
    const [rows] = await pool.execute(
        `SELECT
          p.*,
          cover_photo.url AS cover_photo_url,
          about_image.url AS about_image_url
        FROM profile p
        LEFT JOIN media cover_photo ON cover_photo.id = p.cover_photo_media_id
        LEFT JOIN media about_image ON about_image.id = p.about_image_media_id
        ORDER BY p.id ASC
        LIMIT 1`,
    );
    return rows[0] || null;
}

export async function createProfile(profileData) {
    await pool.execute(
        `INSERT INTO profile (
      name,
      designation,
      cover_photo_media_id,
      about_image_media_id,
      about,
      email,
      phone,
      location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            profileData.name,
            profileData.designation,
            profileData.cover_photo_media_id || null,
            profileData.about_image_media_id || null,
            profileData.about || null,
            profileData.email || null,
            profileData.phone || null,
            profileData.location || null,
        ],
    );

    return findProfile();
}

export async function updateProfileRow(profileId, profileData) {
    await pool.execute(
        `UPDATE profile SET
      name = ?,
      designation = ?,
      cover_photo_media_id = ?,
      about_image_media_id = ?,
      about = ?,
      email = ?,
      phone = ?,
      location = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
        [
            profileData.name,
            profileData.designation,
            profileData.cover_photo_media_id || null,
            profileData.about_image_media_id || null,
            profileData.about || null,
            profileData.email || null,
            profileData.phone || null,
            profileData.location || null,
            profileId,
        ],
    );

    return findProfile();
}

export async function getSocialLinks(profileId) {
    const [rows] = await pool.execute(
        `SELECT id, label, icon, url, display_order AS displayOrder
     FROM social_links
     WHERE profile_id = ?
     ORDER BY display_order ASC, id ASC`,
        [profileId],
    );

    return rows;
}

export async function replaceSocialLinks(profileId, links) {
    await pool.execute(`DELETE FROM social_links WHERE profile_id = ?`, [profileId]);

    if (!links || !links.length) {
        return [];
    }

    const values = links.map((link, index) => [
        profileId,
        link.label,
        link.icon,
        link.url,
        link.display_order ?? link.displayOrder ?? index + 1,
    ]);
    await pool.query(
        `INSERT INTO social_links (profile_id, label, icon, url, display_order)
     VALUES ?`,
        [values],
    );

    return getSocialLinks(profileId);
}

export async function getHeroRoles(profileId) {
    const [rows] = await pool.execute(
        `SELECT id, role, display_order AS displayOrder
     FROM hero_roles
     WHERE profile_id = ?
     ORDER BY display_order ASC, id ASC`,
        [profileId],
    );

    return rows;
}

export async function replaceHeroRoles(profileId, roles) {
    await pool.execute(`DELETE FROM hero_roles WHERE profile_id = ?`, [profileId]);

    if (!roles || !roles.length) {
        return [];
    }

    const values = roles.map((role, index) => [
        profileId,
        typeof role === 'string' ? role : role.role,
        typeof role === 'string' ? index + 1 : role.display_order ?? role.displayOrder ?? index + 1,
    ]);
    await pool.query(`INSERT INTO hero_roles (profile_id, role, display_order) VALUES ?`, [values]);

    return getHeroRoles(profileId);
}

export async function getPortfolioStats(profileId) {
    const [rows] = await pool.execute(
        `SELECT id, label, value, display_order AS displayOrder
     FROM portfolio_stats
     WHERE profile_id = ?
     ORDER BY display_order ASC, id ASC`,
        [profileId],
    );

    return rows;
}

export async function replacePortfolioStats(profileId, stats) {
    await pool.execute(`DELETE FROM portfolio_stats WHERE profile_id = ?`, [profileId]);

    if (!stats || !stats.length) {
        return [];
    }

    const values = stats.map((item, index) => [
        profileId,
        item.label,
        item.value,
        item.display_order ?? item.displayOrder ?? index + 1,
    ]);
    await pool.query(
        `INSERT INTO portfolio_stats (profile_id, label, value, display_order)
     VALUES ?`,
        [values],
    );

    return getPortfolioStats(profileId);
}

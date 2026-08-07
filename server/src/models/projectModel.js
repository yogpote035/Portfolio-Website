import { pool } from '../config/db.js';

function parseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizeListRows(rows) {
    return rows.map((row) => row.description);
}

async function findProjectListItems(projectId, tableName) {
    const allowedTables = new Set([
        'project_features',
        'project_responsibilities',
        'project_challenges',
        'project_future_improvements',
    ]);

    if (!allowedTables.has(tableName)) {
        throw new Error(`Unsupported project list table: ${tableName}`);
    }

    const [rows] = await pool.execute(
        `SELECT id, description, display_order AS displayOrder
     FROM ${tableName}
     WHERE project_id = ?
     ORDER BY display_order ASC, id ASC`,
        [projectId],
    );

    return rows;
}

async function replaceProjectListItems(projectId, tableName, items = []) {
    const allowedTables = new Set([
        'project_features',
        'project_responsibilities',
        'project_challenges',
        'project_future_improvements',
    ]);

    if (!allowedTables.has(tableName)) {
        throw new Error(`Unsupported project list table: ${tableName}`);
    }

    await pool.execute(`DELETE FROM ${tableName} WHERE project_id = ?`, [projectId]);

    const normalizedItems = (items || [])
        .map((item) => (typeof item === 'string' ? item : item?.description))
        .filter(Boolean);

    if (normalizedItems.length === 0) {
        return [];
    }

    const values = normalizedItems.map((description, index) => [projectId, description, index + 1]);
    await pool.query(
        `INSERT INTO ${tableName} (project_id, description, display_order) VALUES ?`,
        [values],
    );

    return findProjectListItems(projectId, tableName);
}

export async function hydrateProjectDetails(project) {
    if (!project) return null;

    const [features, responsibilities, challenges, futureImprovements] = await Promise.all([
        findProjectListItems(project.id, 'project_features'),
        findProjectListItems(project.id, 'project_responsibilities'),
        findProjectListItems(project.id, 'project_challenges'),
        findProjectListItems(project.id, 'project_future_improvements'),
    ]);

    return {
        ...project,
        features: features.length ? normalizeListRows(features) : parseJsonArray(project.features),
        responsibilities: responsibilities.length
            ? normalizeListRows(responsibilities)
            : parseJsonArray(project.responsibilities),
        challenges: challenges.length ? normalizeListRows(challenges) : parseJsonArray(project.challenges),
        future_improvements: futureImprovements.length
            ? normalizeListRows(futureImprovements)
            : parseJsonArray(project.future_improvements),
    };
}

export async function findProjects({ includeArchived = false } = {}) {
    const visibilitySql = includeArchived ? '' : "WHERE p.status != 'archived'";
    const [rows] = await pool.execute(
        `SELECT p.*, tm.url AS thumbnail_url, cm.url AS cover_url
     FROM projects p
     LEFT JOIN media tm ON p.thumbnail_media_id = tm.id
     LEFT JOIN media cm ON p.cover_media_id = cm.id
     ${visibilitySql}
     ORDER BY p.featured DESC, p.display_order ASC, p.created_at DESC`,
    );
    return Promise.all(rows.map((project) => hydrateProjectDetails(project)));
}

export async function findProjectBySlug(slug) {
    const [rows] = await pool.execute(
        `SELECT p.*, tm.url AS thumbnail_url, cm.url AS cover_url
     FROM projects p
     LEFT JOIN media tm ON p.thumbnail_media_id = tm.id
     LEFT JOIN media cm ON p.cover_media_id = cm.id
     WHERE p.slug = ? LIMIT 1`,
        [slug],
    );
    return hydrateProjectDetails(rows[0] || null);
}

export async function findProjectById(id) {
    const [rows] = await pool.execute(
        `SELECT p.*, tm.url AS thumbnail_url, cm.url AS cover_url
     FROM projects p
     LEFT JOIN media tm ON p.thumbnail_media_id = tm.id
     LEFT JOIN media cm ON p.cover_media_id = cm.id
     WHERE p.id = ? LIMIT 1`,
        [id],
    );
    return hydrateProjectDetails(rows[0] || null);
}

export async function findProjectGallery(projectId) {
    const [rows] = await pool.execute(
        `SELECT
          pg.id,
          pg.media_id AS mediaId,
          pg.alt_text AS altText,
          pg.display_order AS displayOrder,
          m.url,
          m.public_id AS publicId,
          m.original_name AS originalName
     FROM project_gallery pg
     LEFT JOIN media m ON pg.media_id = m.id
     WHERE pg.project_id = ?
     ORDER BY pg.display_order ASC, pg.id ASC`,
        [projectId],
    );
    return rows;
}

export async function findProjectTechnologies(projectId) {
    const [rows] = await pool.execute(
        `SELECT s.id, s.name, s.category, s.logo_media_id AS logoMediaId
     FROM project_technologies pt
     JOIN skills s ON pt.skill_id = s.id
     WHERE pt.project_id = ?
     ORDER BY s.name ASC`,
        [projectId],
    );
    return rows;
}

export async function replaceProjectTechnologies(projectId, technologyIds = []) {
    await pool.execute(`DELETE FROM project_technologies WHERE project_id = ?`, [projectId]);

    if (!technologyIds || technologyIds.length === 0) {
        return [];
    }

    const values = technologyIds.map((skillId) => [projectId, skillId]);
    await pool.query(
        `INSERT INTO project_technologies (project_id, skill_id) VALUES ?`,
        [values],
    );

    return findProjectTechnologies(projectId);
}

export async function replaceProjectGallery(projectId, images = []) {
    await pool.execute(`DELETE FROM project_gallery WHERE project_id = ?`, [projectId]);

    if (!images || images.length === 0) {
        return [];
    }

    const values = images.map((image, index) => [projectId, image.mediaId, image.altText || null, image.displayOrder ?? index + 1]);
    await pool.query(
        `INSERT INTO project_gallery (project_id, media_id, alt_text, display_order) VALUES ?`,
        [values],
    );

    return findProjectGallery(projectId);
}

export async function createProject(projectData) {
    const [result] = await pool.execute(
        `INSERT INTO projects (
      name,
      slug,
      subtitle,
      short_description,
      full_description,
      thumbnail_media_id,
      cover_media_id,
      github_url,
      live_url,
      featured,
      company_project,
      status,
      completion_date,
      display_order,
      responsibilities,
      features,
      challenges,
      future_improvements
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            projectData.name,
            projectData.slug,
            projectData.subtitle || null,
            projectData.short_description,
            projectData.full_description,
            projectData.thumbnail_media_id || null,
            projectData.cover_media_id || null,
            projectData.github_url || null,
            projectData.live_url || null,
            projectData.featured ?? false,
            projectData.company_project ?? false,
            projectData.status || 'completed',
            projectData.completion_date || null,
            projectData.display_order || 1,
            JSON.stringify(projectData.responsibilities || []),
            JSON.stringify(projectData.features || []),
            JSON.stringify(projectData.challenges || []),
            JSON.stringify(projectData.future_improvements || []),
        ],
    );

    const project = await findProjectById(result.insertId);
    if (projectData.technologyIds) {
        await replaceProjectTechnologies(result.insertId, projectData.technologyIds);
    }
    if (projectData.galleryImages) {
        await replaceProjectGallery(result.insertId, projectData.galleryImages);
    }
    await Promise.all([
        replaceProjectListItems(result.insertId, 'project_features', projectData.features),
        replaceProjectListItems(result.insertId, 'project_responsibilities', projectData.responsibilities),
        replaceProjectListItems(result.insertId, 'project_challenges', projectData.challenges),
        replaceProjectListItems(result.insertId, 'project_future_improvements', projectData.future_improvements),
    ]);

    return findProjectById(result.insertId);
}

export async function updateProjectById(id, projectData) {
    await pool.execute(
        `UPDATE projects SET
      name = ?,
      slug = ?,
      subtitle = ?,
      short_description = ?,
      full_description = ?,
      thumbnail_media_id = ?,
      cover_media_id = ?,
      github_url = ?,
      live_url = ?,
      featured = ?,
      company_project = ?,
      status = ?,
      completion_date = ?,
      display_order = ?,
      responsibilities = ?,
      features = ?,
      challenges = ?,
      future_improvements = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
        [
            projectData.name,
            projectData.slug,
            projectData.subtitle || null,
            projectData.short_description,
            projectData.full_description,
            projectData.thumbnail_media_id || null,
            projectData.cover_media_id || null,
            projectData.github_url || null,
            projectData.live_url || null,
            projectData.featured ?? false,
            projectData.company_project ?? false,
            projectData.status || 'completed',
            projectData.completion_date || null,
            projectData.display_order || 1,
            JSON.stringify(projectData.responsibilities || []),
            JSON.stringify(projectData.features || []),
            JSON.stringify(projectData.challenges || []),
            JSON.stringify(projectData.future_improvements || []),
            id,
        ],
    );

    if (projectData.technologyIds) {
        await replaceProjectTechnologies(id, projectData.technologyIds);
    }

    if (projectData.galleryImages) {
        await replaceProjectGallery(id, projectData.galleryImages);
    }

    const listUpdates = [];
    if (projectData.features) {
        listUpdates.push(replaceProjectListItems(id, 'project_features', projectData.features));
    }
    if (projectData.responsibilities) {
        listUpdates.push(replaceProjectListItems(id, 'project_responsibilities', projectData.responsibilities));
    }
    if (projectData.challenges) {
        listUpdates.push(replaceProjectListItems(id, 'project_challenges', projectData.challenges));
    }
    if (projectData.future_improvements) {
        listUpdates.push(
            replaceProjectListItems(id, 'project_future_improvements', projectData.future_improvements),
        );
    }

    await Promise.all(listUpdates);

    return findProjectById(id);
}

export async function deleteProjectById(id) {
    const [result] = await pool.execute(
        `DELETE FROM projects WHERE id = ?`,
        [id],
    );
    return result.affectedRows > 0;
}

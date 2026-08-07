import { pool } from '../config/db.js';
import { findRecentActivity } from '../models/activityLogModel.js';
import { sendSuccess } from '../utils/apiResponse.js';

async function getSingleCount(sql, params = []) {
    const [[row]] = await pool.execute(sql, params);
    return Number(row?.count || 0);
}

export async function getAdminDashboard(req, res) {
    const [
        totalProjects,
        totalSkills,
        totalExperiences,
        totalEducation,
        totalContacts,
        unreadContacts,
        resumeDownloadsRows,
        recentContactsRows,
        recentActivity,
    ] = await Promise.all([
        getSingleCount(`SELECT COUNT(*) AS count FROM projects WHERE status != 'archived'`),
        getSingleCount(`SELECT COUNT(*) AS count FROM skills WHERE is_active = TRUE`),
        getSingleCount(`SELECT COUNT(*) AS count FROM experiences`),
        getSingleCount(`SELECT COUNT(*) AS count FROM education`),
        getSingleCount(`SELECT COUNT(*) AS count FROM contacts`),
        getSingleCount(`SELECT COUNT(*) AS count FROM contacts WHERE status = 'unread'`),
        pool.execute(`SELECT COALESCE(SUM(download_count), 0) AS count FROM resumes`),
        pool.execute(
            `SELECT id, name, email, subject, status, is_starred, created_at
       FROM contacts
       ORDER BY created_at DESC
       LIMIT 5`,
        ),
        findRecentActivity(8),
    ]);

    return sendSuccess(res, 'Dashboard fetched successfully', {
        totals: {
            projects: totalProjects,
            skills: totalSkills,
            experiences: totalExperiences,
            education: totalEducation,
            contacts: totalContacts,
            unreadContacts,
            resumeDownloads: Number(resumeDownloadsRows[0][0]?.count || 0),
        },
        recentContacts: recentContactsRows[0],
        recentActivity,
    });
}

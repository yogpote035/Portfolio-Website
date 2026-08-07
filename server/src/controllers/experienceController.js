import { sendSuccess } from '../utils/apiResponse.js';
import {
    createExperience,
    deleteExperienceById,
    findExperienceById,
    findExperiences,
    updateExperienceById,
} from '../models/experienceModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import { recordContentVersion } from '../services/contentVersion.service.js';

function parseJsonArray(value) {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
}

export async function getExperience(req, res) {
    const experiences = await findExperiences();
    return sendSuccess(res, 'Experiences fetched successfully', experiences);
}

export async function getAdminExperience(req, res) {
    const experiences = await findExperiences();
    return sendSuccess(res, 'Admin experiences fetched successfully', experiences);
}

export async function createNewExperience(req, res) {
    const experienceData = req.validated.body;
    const experience = await createExperience(experienceData);
    await recordContentVersion(req, 'experience', experience.id, `Experience created: ${experience.company}`);
    await logAdminActivity(req, {
        action: 'experience.created',
        entityType: 'experience',
        entityId: experience.id,
        description: `Experience added: ${experience.company}`,
        metadata: { company: experience.company, jobTitle: experience.job_title },
    });
    return sendSuccess(res, 'Experience created successfully', experience, 201);
}

export async function updateExperience(req, res) {
    const { id } = req.params;
    const existing = await findExperienceById(id);

    if (!existing) {
        const error = new Error('Experience not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateExperienceById(id, {
        ...existing,
        responsibilities: parseJsonArray(existing.responsibilities),
        technologies: parseJsonArray(existing.technologies),
        ...req.validated.body,
    });
    await recordContentVersion(req, 'experience', updated.id, `Experience saved: ${updated.company}`);
    await logAdminActivity(req, {
        action: 'experience.updated',
        entityType: 'experience',
        entityId: updated.id,
        description: `Experience updated: ${updated.company}`,
        metadata: { company: updated.company, jobTitle: updated.job_title },
    });
    return sendSuccess(res, 'Experience updated successfully', updated);
}

export async function deleteExperience(req, res) {
    const { id } = req.params;
    const existing = await findExperienceById(id);

    if (!existing) {
        const error = new Error('Experience not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteExperienceById(id);
    await logAdminActivity(req, {
        action: 'experience.deleted',
        entityType: 'experience',
        entityId: existing.id,
        description: `Experience deleted: ${existing.company}`,
        metadata: { company: existing.company, jobTitle: existing.job_title },
    });
    return sendSuccess(res, 'Experience deleted successfully');
}

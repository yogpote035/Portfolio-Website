import { sendSuccess } from '../utils/apiResponse.js';
import {
    createEducationEntry,
    deleteEducationById,
    findEducationById,
    findEducationEntries,
    updateEducationById,
} from '../models/educationModel.js';
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

export async function getEducation(req, res) {
    const educationEntries = await findEducationEntries();
    return sendSuccess(res, 'Education entries fetched successfully', educationEntries);
}

export async function getAdminEducation(req, res) {
    const educationEntries = await findEducationEntries();
    return sendSuccess(res, 'Admin education entries fetched successfully', educationEntries);
}

export async function createNewEducation(req, res) {
    const education = await createEducationEntry(req.validated.body);
    await recordContentVersion(req, 'education', education.id, `Education created: ${education.degree}`);
    await logAdminActivity(req, {
        action: 'education.created',
        entityType: 'education',
        entityId: education.id,
        description: `Education added: ${education.degree}`,
        metadata: { college: education.college },
    });
    return sendSuccess(res, 'Education entry created successfully', education, 201);
}

export async function updateEducation(req, res) {
    const { id } = req.params;
    const existing = await findEducationById(id);

    if (!existing) {
        const error = new Error('Education entry not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateEducationById(id, {
        ...existing,
        coursework: parseJsonArray(existing.coursework),
        ...req.validated.body,
    });
    await recordContentVersion(req, 'education', updated.id, `Education saved: ${updated.degree}`);
    await logAdminActivity(req, {
        action: 'education.updated',
        entityType: 'education',
        entityId: updated.id,
        description: `Education updated: ${updated.degree}`,
        metadata: { college: updated.college },
    });
    return sendSuccess(res, 'Education entry updated successfully', updated);
}

export async function deleteEducation(req, res) {
    const { id } = req.params;
    const existing = await findEducationById(id);

    if (!existing) {
        const error = new Error('Education entry not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteEducationById(id);
    await logAdminActivity(req, {
        action: 'education.deleted',
        entityType: 'education',
        entityId: existing.id,
        description: `Education deleted: ${existing.degree}`,
        metadata: { college: existing.college },
    });
    return sendSuccess(res, 'Education entry deleted successfully');
}

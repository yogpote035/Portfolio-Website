import { sendSuccess } from '../utils/apiResponse.js';
import { uploadResume, deleteResume, getResumeUrl } from '../services/supabaseStorage.service.js';
import {
    activateResumeById,
    createActiveResume,
    deleteResumeById,
    findActiveResume,
    findResumeById,
    findResumes,
    incrementResumeDownloadCount,
    updateResumeById,
} from '../models/resumeModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';

async function getActiveResumeUrl() {
    const resume = await findActiveResume();

    if (!resume) {
        const error = new Error('No active resume found');
        error.statusCode = 404;
        throw error;
    }

    const storedUrlIsDurable = resume.file_url && !resume.file_url.includes('/storage/v1/object/sign/');
    let resumeUrl = storedUrlIsDurable ? resume.file_url : null;

    if (resume.storage_path) {
        try {
            resumeUrl = await getResumeUrl(resume.storage_path);
        } catch (error) {
            if (!resumeUrl) throw error;
        }
    }

    return { resume, resumeUrl };
}

async function withFreshPreview(resume) {
    if (!resume) return resume;

    const storedUrlIsDurable = resume.file_url && !resume.file_url.includes('/storage/v1/object/sign/');
    let previewUrl = storedUrlIsDurable ? resume.file_url : null;
    let previewAvailable = Boolean(previewUrl);

    if (resume.storage_path) {
        try {
            previewUrl = await getResumeUrl(resume.storage_path);
            previewAvailable = Boolean(previewUrl);
        } catch {
            // Older rows can reference moved or deleted objects. Keep list retrieval usable.
            previewAvailable = Boolean(previewUrl);
        }
    }

    return {
        ...resume,
        file_url: previewUrl,
        preview_url: previewUrl,
        preview_available: previewAvailable,
    };
}

export async function uploadNewResume(req, res) {
    const file = req.file;
    if (!file) {
        const error = new Error('Resume file is required');
        error.statusCode = 400;
        throw error;
    }

    const supabaseResult = await uploadResume(file);
    const resume = await createActiveResume({
        ...supabaseResult,
        created_by: req.user?.id || null,
    });

    await logAdminActivity(req, {
        action: 'resume.uploaded',
        entityType: 'resume',
        entityId: resume.id,
        description: `Resume uploaded: ${resume.original_name}`,
        metadata: { version: resume.version, isActive: Boolean(resume.is_active) },
    });

    return sendSuccess(res, 'Resume uploaded successfully', resume, 201);
}

export async function getPublicResume(req, res) {
    let activeResume;

    try {
        activeResume = await getActiveResumeUrl();
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'RESUME_PREVIEW_UNAVAILABLE') {
            activeResume = null;
        } else {
            throw error;
        }
    }

    if (!activeResume) {
        if (req.query.redirect === 'false') {
            return sendSuccess(res, 'No active resume found', { url: null });
        }

        const error = new Error('No active resume found');
        error.statusCode = 404;
        throw error;
    }

    if (req.query.redirect === 'false') {
        return sendSuccess(res, 'Resume URL fetched successfully', { url: activeResume.resumeUrl });
    }

    await incrementResumeDownloadCount(activeResume.resume.id);
    return res.redirect(activeResume.resumeUrl);
}

export async function createResumeDownload(req, res) {
    const { resume, resumeUrl } = await getActiveResumeUrl();
    await incrementResumeDownloadCount(resume.id);

    return sendSuccess(res, 'Resume download URL created successfully', {
        id: resume.id,
        url: resumeUrl,
        original_name: resume.original_name,
    });
}

export async function getAdminResumes(req, res) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = req.query.search || null;

    const { rows, count } = await findResumes({ page, limit, search });
    const resumes = await Promise.all(rows.map(withFreshPreview));
    return sendSuccess(res, 'Resumes fetched successfully', { data: resumes, page, limit, total: count });
}

export async function getAdminResume(req, res) {
    const { id } = req.params;
    const resume = await findResumeById(id);
    if (!resume) {
        const error = new Error('Resume not found');
        error.statusCode = 404;
        throw error;
    }

    return sendSuccess(res, 'Resume fetched successfully', await withFreshPreview(resume));
}

export async function updateResume(req, res) {
    const { id } = req.params;
    const resume = await findResumeById(id);
    if (!resume) {
        const error = new Error('Resume not found');
        error.statusCode = 404;
        throw error;
    }

    const updatePayload = {
        ...(req.validated.body || {}),
        original_name: req.validated.body?.original_name ?? null,
        version: req.validated.body?.version ?? null,
        is_active: req.validated.body?.is_active === undefined ? null : req.validated.body.is_active ? 1 : 0,
    };

    if (req.validated.body?.is_active) {
        const activated = await activateResumeById(id);
        const updateWithoutActive = { ...updatePayload, is_active: null };
        if (req.validated.body?.original_name !== undefined || req.validated.body?.version !== undefined) {
            const updated = await updateResumeById(id, updateWithoutActive);
            await logAdminActivity(req, {
                action: 'resume.activated',
                entityType: 'resume',
                entityId: updated.id,
                description: `Resume activated: ${updated.original_name}`,
                metadata: { version: updated.version },
            });
            return sendSuccess(res, 'Resume updated successfully', updated);
        }
        await logAdminActivity(req, {
            action: 'resume.activated',
            entityType: 'resume',
            entityId: activated.id,
            description: `Resume activated: ${activated.original_name}`,
            metadata: { version: activated.version },
        });
        return sendSuccess(res, 'Resume updated successfully', activated);
    }

    const updated = await updateResumeById(id, updatePayload);
    await logAdminActivity(req, {
        action: 'resume.updated',
        entityType: 'resume',
        entityId: updated.id,
        description: `Resume updated: ${updated.original_name}`,
        metadata: { version: updated.version },
    });
    return sendSuccess(res, 'Resume updated successfully', updated);
}

export async function activateResume(req, res) {
    const { id } = req.params;
    const resume = await activateResumeById(id);

    if (!resume) {
        const error = new Error('Resume not found');
        error.statusCode = 404;
        throw error;
    }

    await logAdminActivity(req, {
        action: 'resume.activated',
        entityType: 'resume',
        entityId: resume.id,
        description: `Resume activated: ${resume.original_name}`,
        metadata: { version: resume.version },
    });

    return sendSuccess(res, 'Resume activated successfully', resume);
}

export async function removeResume(req, res) {
    const { id } = req.params;
    const resume = await findResumeById(id);
    if (!resume) {
        const error = new Error('Resume not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteResume(resume.storage_path);
    await deleteResumeById(id);
    await logAdminActivity(req, {
        action: 'resume.deleted',
        entityType: 'resume',
        entityId: resume.id,
        description: `Resume deleted: ${resume.original_name}`,
        metadata: { version: resume.version },
    });

    return sendSuccess(res, 'Resume deleted successfully');
}

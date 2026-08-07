import { sendSuccess } from '../utils/apiResponse.js';
import {
    createMedia,
    deleteMediaById,
    findMedia,
    findMediaById,
    updateMediaById,
} from '../models/mediaModel.js';
import { deleteImage, replaceImage, uploadImage } from '../services/cloudinary.service.js';

const ALLOWED_IMAGE_FOLDERS = new Set([
    'profile',
    'hero',
    'projects',
    'project_images',
    'company_logos',
    'skill_logos',
    'portfolio',
]);

function getUploadFolder(req) {
    const requestedFolder = req.body?.folder || req.query?.folder || 'portfolio';

    if (!ALLOWED_IMAGE_FOLDERS.has(requestedFolder)) {
        const error = new Error('Invalid image folder');
        error.statusCode = 422;
        throw error;
    }

    return requestedFolder;
}

function buildMediaPayload({ file, uploadResult, createdBy }) {
    return {
        file_name: uploadResult.public_id,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_provider: 'cloudinary',
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        folder: uploadResult.folder,
        created_by: createdBy || null,
    };
}

export async function getAdminMedia(req, res) {
    const result = await findMedia({
        page: req.query.page,
        limit: req.query.limit,
        folder: req.query.folder,
        provider: req.query.provider,
        search: req.query.search,
    });

    return sendSuccess(res, 'Media fetched successfully', result);
}

export async function uploadImageMedia(req, res) {
    const file = req.file;
    if (!file) {
        const error = new Error('Image file is required');
        error.statusCode = 400;
        throw error;
    }

    const folder = getUploadFolder(req);
    const uploadResult = await uploadImage(file, folder);
    const media = await createMedia(buildMediaPayload({
        file,
        uploadResult,
        createdBy: req.user?.id,
    }));

    return sendSuccess(res, 'Image uploaded successfully', media, 201);
}

export async function replaceImageMedia(req, res) {
    const existing = await findMediaById(req.params.id);
    if (!existing) {
        const error = new Error('Media item not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.storage_provider !== 'cloudinary') {
        const error = new Error('Only Cloudinary image media can be replaced here');
        error.statusCode = 400;
        throw error;
    }

    const file = req.file;
    if (!file) {
        const error = new Error('Replacement image file is required');
        error.statusCode = 400;
        throw error;
    }

    const folder = getUploadFolder(req);
    const uploadResult = await replaceImage(existing.public_id, file, folder);
    const media = await updateMediaById(existing.id, buildMediaPayload({
        file,
        uploadResult,
        createdBy: req.user?.id,
    }));

    return sendSuccess(res, 'Image replaced successfully', media);
}

export async function deleteImageMedia(req, res) {
    const existing = await findMediaById(req.params.id);
    if (!existing) {
        const error = new Error('Media item not found');
        error.statusCode = 404;
        throw error;
    }

    if (existing.storage_provider === 'cloudinary' && existing.public_id) {
        await deleteImage(existing.public_id);
    }

    await deleteMediaById(existing.id);
    return sendSuccess(res, 'Media deleted successfully');
}

export async function uploadProjectImage(req, res) {
    const file = req.file;
    if (!file) {
        const error = new Error('Image file is required');
        error.statusCode = 400;
        throw error;
    }

    const uploadResult = await uploadImage(file, 'project_images');
    const media = await createMedia({
        file_name: uploadResult.public_id,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_provider: 'cloudinary',
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        folder: uploadResult.folder,
        created_by: req.user?.id || null,
    });

    return sendSuccess(res, 'Image uploaded successfully', media, 201);
}

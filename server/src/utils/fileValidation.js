import path from 'path';

const IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);

const RESUME_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const validateImageFile = (file, maxSizeBytes = 5 * 1024 * 1024) => {
    if (!file || !file.buffer) {
        const error = new Error('Image file is required');
        error.statusCode = 400;
        throw error;
    }

    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
        const error = new Error('Unsupported image type');
        error.statusCode = 415;
        throw error;
    }

    if (file.size > maxSizeBytes) {
        const error = new Error(`Image must be smaller than ${maxSizeBytes / 1024 / 1024} MB`);
        error.statusCode = 413;
        throw error;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(extension)) {
        const error = new Error('Unsupported image extension');
        error.statusCode = 415;
        throw error;
    }
};

export const validateResumeFile = (file, maxSizeBytes = 10 * 1024 * 1024) => {
    if (!file || !file.buffer) {
        const error = new Error('Resume file is required');
        error.statusCode = 400;
        throw error;
    }

    if (!RESUME_MIME_TYPES.has(file.mimetype)) {
        const error = new Error('Unsupported resume type');
        error.statusCode = 415;
        throw error;
    }

    if (file.size > maxSizeBytes) {
        const error = new Error(`Resume file must be smaller than ${maxSizeBytes / 1024 / 1024} MB`);
        error.statusCode = 413;
        throw error;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
        const error = new Error('Unsupported resume extension');
        error.statusCode = 415;
        throw error;
    }
};

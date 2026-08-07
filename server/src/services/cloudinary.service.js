import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
});

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function getPublicId(folder) {
    const name = `${Date.now()}_${nanoid(10)}`;
    return folder ? `${folder}/${name}` : name;
}

function getExtension(filename) {
    const match = filename?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/);
    return match ? match[0] : '';
}

export function validateImageFile(file, maxSizeBytes = MAX_IMAGE_SIZE_BYTES) {
    if (!file || !file.buffer) {
        const error = new Error('Image file is required');
        error.statusCode = 400;
        throw error;
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error('Unsupported image type');
        error.statusCode = 415;
        throw error;
    }

    if (file.size > maxSizeBytes) {
        const error = new Error(`Image must be smaller than ${maxSizeBytes / 1024 / 1024} MB`);
        error.statusCode = 413;
        throw error;
    }

    const extension = getExtension(file.originalname);
    if (!extension) {
        const error = new Error('Image file extension is not allowed');
        error.statusCode = 415;
        throw error;
    }
}

export async function uploadImage(file, folder = 'portfolio', options = {}) {
    validateImageFile(file);

    const public_id = options.public_id || getPublicId(folder);
    const uploadOptions = {
        folder,
        public_id,
        overwrite: options.overwrite ?? false,
        resource_type: 'image',
        ...options,
    };

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                url: result.secure_url || result.url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                folder: result.folder,
            });
        });

        bufferToStream(file.buffer).pipe(uploadStream);
    });
}

export async function deleteImage(publicId) {
    if (!publicId) {
        return null;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
    });

    return result;
}

export async function replaceImage(existingPublicId, file, folder = 'portfolio') {
    if (!file) {
        const error = new Error('Image file is required to replace an existing image');
        error.statusCode = 400;
        throw error;
    }

    if (existingPublicId) {
        return uploadImage(file, folder, { public_id: existingPublicId, overwrite: true, invalidate: true });
    }

    return uploadImage(file, folder);
}

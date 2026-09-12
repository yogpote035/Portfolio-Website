import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { validateResumeFile } from '../utils/fileValidation.js';

function getSupabaseClient() {
    if (!env.supabase.url || !env.supabase.serviceRoleKey) {
        const error = new Error('Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env to enable resume uploads.');
        error.statusCode = 500;
        throw error;
    }

    return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
        auth: { persistSession: false },
    });
}

function getStorageFileKey(storagePath) {
    const bucket = env.supabase.resumeBucket;
    let value = String(storagePath || '').trim();

    try {
        if (/^https?:\/\//i.test(value)) {
            const pathname = decodeURIComponent(new URL(value).pathname);
            const markers = [
                `/storage/v1/object/sign/${bucket}/`,
                `/storage/v1/object/public/${bucket}/`,
                `/storage/v1/object/${bucket}/`,
            ];
            const marker = markers.find((item) => pathname.includes(item));
            value = marker ? pathname.split(marker)[1] : pathname;
        }
    } catch {
        // Continue with the stored value; Supabase will return a useful storage error.
    }

    value = value.replace(/^\/+/, '');
    while (value.startsWith(`${bucket}/`)) {
        value = value.slice(bucket.length + 1);
    }

    return value;
}

export async function uploadResume(file) {
    validateResumeFile(file);
    const supabase = getSupabaseClient();

    const safeOriginalName = file.originalname
        .replace(/[^\w.\- ]+/g, '')
        .trim()
        .replace(/\s+/g, '_');
    const fileName = `${Date.now()}_${nanoid(8)}_${safeOriginalName || 'resume'}`;
    const storagePath = `${env.supabase.resumeBucket}/${fileName}`;

    const { error } = await supabase.storage.from(env.supabase.resumeBucket).upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });

    if (error) {
        const err = new Error('Failed to upload resume to Supabase');
        err.statusCode = 500;
        throw err;
    }

    const fileUrl = await getResumeUrl(storagePath, 60 * 60 * 24 * 30);

    return {
        original_name: file.originalname,
        storage_path: storagePath,
        file_url: fileUrl,
        mime_type: file.mimetype,
        file_size: file.size,
    };
}

export async function deleteResume(storagePath) {
    if (!storagePath) {
        return null;
    }

    const supabase = getSupabaseClient();
    const fileKey = getStorageFileKey(storagePath);
    const { error } = await supabase.storage.from(env.supabase.resumeBucket).remove([fileKey]);

    if (error) {
        const err = new Error('Failed to delete resume from Supabase');
        err.statusCode = 500;
        throw err;
    }

    return true;
}

export async function getResumeUrl(storagePath, expiresInSeconds = 60 * 60 * 24) {
    if (!storagePath) {
        return null;
    }

    const supabase = getSupabaseClient();
    const fileKey = getStorageFileKey(storagePath);
    if (!fileKey) {
        const err = new Error('Resume storage path is invalid');
        err.statusCode = 422;
        throw err;
    }
    const { data, error } = await supabase.storage
        .from(env.supabase.resumeBucket)
        .createSignedUrl(fileKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
        const err = new Error(`Failed to generate resume preview URL${error?.message ? `: ${error.message}` : ''}`);
        err.statusCode = 500;
        err.code = 'RESUME_PREVIEW_UNAVAILABLE';
        err.storageError = error?.message || 'Signed URL was not returned';
        throw err;
    }

    return data?.signedUrl || null;
}

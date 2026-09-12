import { z } from 'zod';

const urlSchema = z.string().url().nullable().optional();
const booleanSchema = z.preprocess(
    (value) => (value === 1 || value === '1' ? true : value === 0 || value === '0' ? false : value),
    z.boolean(),
);

const trimNullableString = z.preprocess((value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string') return value.trim();
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object' && value?.toString) return String(value).trim();
    return value;
}, z.string().min(1).nullable().optional());

const completionDateSchema = z.preprocess((value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'string') return value.trim();
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object' && value?.date) return String(value.date).trim();
    return String(value).trim();
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional());

const projectBodySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    short_description: z.string().min(1),
    full_description: z.string().min(1),
    subtitle: trimNullableString,
    thumbnail_media_id: z.number().int().positive().nullable().optional(),
    cover_media_id: z.number().int().positive().nullable().optional(),
    github_url: urlSchema,
    live_url: urlSchema,
    featured: booleanSchema.optional(),
    project_type: z.enum(['personal', 'company', 'freelance']).optional(),
    status: z.enum(['planned', 'in_progress', 'completed', 'archived']).optional(),
    completion_date: completionDateSchema,
    display_order: z.number().int().positive().optional(),
    responsibilities: z.array(z.string().min(1)).optional(),
    features: z.array(z.string().min(1)).optional(),
    challenges: z.array(z.string().min(1)).optional(),
    future_improvements: z.array(z.string().min(1)).optional(),
    technologyIds: z.array(z.number().int().positive()).optional(),
    galleryImages: z.array(
        z.object({
            mediaId: z.number().int().positive(),
            altText: z.string().nullable().optional(),
            displayOrder: z.number().int().positive().optional(),
        }),
    ).optional(),
});

export const projectSchema = z.object({
    body: z.object({
        ...projectBodySchema.shape,
    }),
});

export const projectUpdateSchema = z.object({
    body: projectBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
        message: 'At least one project field is required',
    }),
});

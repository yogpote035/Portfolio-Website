import { z } from 'zod';

const skillBodySchema = z.object({
    name: z.string().min(1),
    category: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, 'Category must use lowercase letters, numbers, and underscores'),
    logo_media_id: z.number().int().positive().nullable().optional(),
    color: z.string().nullable().optional(),
    level: z.number().int().min(0).max(100).nullable().optional(),
    display_order: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
});

export const skillSchema = z.object({
    body: z.object({
        ...skillBodySchema.shape,
    }),
});

export const skillUpdateSchema = z.object({
    body: skillBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
        message: 'At least one skill field is required',
    }),
});

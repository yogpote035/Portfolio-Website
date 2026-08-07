import { z } from 'zod';

const experienceBodySchema = z.object({
    company: z.string().min(1),
    company_logo_media_id: z.number().int().positive().nullable().optional(),
    job_title: z.string().min(1),
    employment_type: z.string().nullable().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    current_company: z.boolean().optional(),
    location: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    responsibilities: z.array(z.string().min(1)).optional(),
    technologies: z.array(z.string().min(1)).optional(),
    display_order: z.number().int().positive().optional(),
});

export const experienceSchema = z.object({
    body: z.object({
        ...experienceBodySchema.shape,
    }),
});

export const experienceUpdateSchema = z.object({
    body: experienceBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
        message: 'At least one experience field is required',
    }),
});

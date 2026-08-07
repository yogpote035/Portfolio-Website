import { z } from 'zod';

const educationBodySchema = z.object({
    degree: z.string().min(1),
    college: z.string().min(1),
    university: z.string().nullable().optional(),
    cgpa: z.string().nullable().optional(),
    percentage: z.string().nullable().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    description: z.string().nullable().optional(),
    coursework: z.array(z.string().min(1)).optional(),
    display_order: z.number().int().positive().optional(),
});

export const educationSchema = z.object({
    body: z.object({
        ...educationBodySchema.shape,
    }),
});

export const educationUpdateSchema = z.object({
    body: educationBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
        message: 'At least one education field is required',
    }),
});

import { z } from 'zod';

export const resumeUpdateSchema = z.object({
    body: z.object({
        original_name: z.string().min(1).optional(),
        version: z.number().int().positive().optional(),
        is_active: z.boolean().optional(),
    }),
});

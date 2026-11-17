import { z } from 'zod';

const categoryShape = {
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(120),
  icon: z.string().trim().min(1).max(80).optional(),
  display_order: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
};

export const skillCategorySchema = z.object({ body: z.object(categoryShape) });
export const skillCategoryUpdateSchema = z.object({ body: z.object(categoryShape).partial().refine((value) => Object.keys(value).length > 0) });

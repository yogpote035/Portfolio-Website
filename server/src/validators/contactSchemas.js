import { z } from 'zod';

export const contactCreateSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional().nullable(),
        company: z.string().optional().nullable(),
        subject: z.string().min(3, 'Subject must be at least 3 characters'),
        message: z.string().min(10, 'Message must be at least 10 characters'),
    }),
});

const booleanSchema = z.preprocess((value) => {
    if (value === 1 || value === '1' || value === true || value === 'true') {
        return true;
    }
    if (value === 0 || value === '0' || value === false || value === 'false') {
        return false;
    }
    return value;
}, z.boolean());

const contactUpdateBodySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    subject: z.string().min(3, 'Subject must be at least 3 characters').optional(),
    message: z.string().min(10, 'Message must be at least 10 characters').optional(),
    status: z.enum(['unread', 'read', 'archived']).optional(),
    is_starred: booleanSchema.optional(),
});

export const contactUpdateSchema = z.object({
    body: contactUpdateBodySchema.refine((value) => Object.keys(value).length > 0, {
        message: 'At least one contact field is required',
    }),
});

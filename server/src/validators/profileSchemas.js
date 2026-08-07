import { z } from 'zod';

const socialLinkSchema = z.object({
    label: z.string().min(1),
    icon: z.string().min(1),
    url: z.string().url(),
    display_order: z.number().int().positive().optional(),
});

const statSchema = z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    display_order: z.number().int().positive().optional(),
});

export const profileUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        designation: z.string().min(1),
        cover_photo_media_id: z.number().int().positive().nullable().optional(),
        about: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
        phone: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        socials: z.array(socialLinkSchema).optional(),
        typingRoles: z.array(z.string().min(1)).optional(),
        stats: z.array(statSchema).optional(),
    }),
});

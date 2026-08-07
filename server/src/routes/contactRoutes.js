import express from 'express';
import {
    deleteContact,
    getAdminContact,
    getAdminContacts,
    submitContact,
    updateContact,
} from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { contactCreateSchema, contactUpdateSchema } from '../validators/contactSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

router.post('/contact', validate(contactCreateSchema), asyncHandler(submitContact));
router.get('/admin/contacts', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(getAdminContacts));
router.get('/admin/contacts/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(getAdminContact));
router.put('/admin/contacts/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(contactUpdateSchema), asyncHandler(updateContact));
router.delete('/admin/contacts/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(deleteContact));

export default router;

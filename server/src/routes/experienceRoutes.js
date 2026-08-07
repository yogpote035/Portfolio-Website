import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createNewExperience,
    deleteExperience,
    getAdminExperience,
    getExperience,
    updateExperience,
} from '../controllers/experienceController.js';
import { validate } from '../middleware/validate.js';
import { experienceSchema, experienceUpdateSchema } from '../validators/experienceSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/experience', asyncHandler(getExperience));
router.get('/admin/experience', adminOnly, asyncHandler(getAdminExperience));
router.post('/admin/experience', adminOnly, validate(experienceSchema), asyncHandler(createNewExperience));
router.put('/admin/experience/:id', adminOnly, validate(experienceUpdateSchema), asyncHandler(updateExperience));
router.delete('/admin/experience/:id', adminOnly, asyncHandler(deleteExperience));

export default router;

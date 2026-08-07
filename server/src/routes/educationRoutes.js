import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createNewEducation,
    deleteEducation,
    getAdminEducation,
    getEducation,
    updateEducation,
} from '../controllers/educationController.js';
import { validate } from '../middleware/validate.js';
import { educationSchema, educationUpdateSchema } from '../validators/educationSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/education', asyncHandler(getEducation));
router.get('/admin/education', adminOnly, asyncHandler(getAdminEducation));
router.post('/admin/education', adminOnly, validate(educationSchema), asyncHandler(createNewEducation));
router.put('/admin/education/:id', adminOnly, validate(educationUpdateSchema), asyncHandler(updateEducation));
router.delete('/admin/education/:id', adminOnly, asyncHandler(deleteEducation));

export default router;

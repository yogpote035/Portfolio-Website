import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema } from '../validators/profileSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/profile', asyncHandler(getProfile));
router.put('/admin/profile', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(profileUpdateSchema), asyncHandler(updateProfile));

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getContentVersions, restoreVersion } from '../controllers/contentVersionController.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/admin/content-versions', adminOnly, asyncHandler(getContentVersions));
router.post('/admin/content-versions/:id/restore', adminOnly, asyncHandler(restoreVersion));

export default router;

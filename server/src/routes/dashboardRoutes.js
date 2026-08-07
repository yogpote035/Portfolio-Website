import { Router } from 'express';
import { ROLES } from '../constants/roles.js';
import { getAdminDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
    '/admin/dashboard',
    authenticate,
    authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    asyncHandler(getAdminDashboard),
);

export default router;

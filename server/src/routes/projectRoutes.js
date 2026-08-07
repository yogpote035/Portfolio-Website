import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createNewProject,
    deleteProject,
    getAdminProjects,
    getProjectBySlug,
    getProjects,
    updateProject,
} from '../controllers/projectController.js';
import { uploadProjectImage } from '../controllers/mediaController.js';
import { validate } from '../middleware/validate.js';
import { projectSchema, projectUpdateSchema } from '../validators/projectSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/projects', asyncHandler(getProjects));
router.get('/projects/:slug', asyncHandler(getProjectBySlug));
router.get('/admin/projects', adminOnly, asyncHandler(getAdminProjects));
router.post('/admin/projects', adminOnly, validate(projectSchema), asyncHandler(createNewProject));
router.put('/admin/projects/:id', adminOnly, validate(projectUpdateSchema), asyncHandler(updateProject));
router.delete('/admin/projects/:id', adminOnly, asyncHandler(deleteProject));
router.post('/admin/projects/image', adminOnly, upload.single('image'), asyncHandler(uploadProjectImage));

export default router;

import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';
import {
    activateResume,
    createResumeDownload,
    getAdminResume,
    getAdminResumes,
    getPublicResume,
    removeResume,
    updateResume,
    uploadNewResume,
} from '../controllers/resumeController.js';
import { validate } from '../middleware/validate.js';
import { resumeUpdateSchema } from '../validators/resumeSchemas.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});
const router = express.Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/resume', asyncHandler(getPublicResume));
router.post('/resume/download', asyncHandler(createResumeDownload));
router.get('/admin/resumes', adminOnly, asyncHandler(getAdminResumes));
router.get('/admin/resumes/:id', adminOnly, asyncHandler(getAdminResume));
router.post('/admin/resumes', adminOnly, upload.single('resume'), asyncHandler(uploadNewResume));
router.put('/admin/resumes/:id', adminOnly, validate(resumeUpdateSchema), asyncHandler(updateResume));
router.put('/admin/resumes/:id/activate', adminOnly, asyncHandler(activateResume));
router.delete('/admin/resumes/:id', adminOnly, asyncHandler(removeResume));

export default router;

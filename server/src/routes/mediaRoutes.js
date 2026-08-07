import multer from 'multer';
import { Router } from 'express';
import { ROLES } from '../constants/roles.js';
import {
    deleteImageMedia,
    getAdminMedia,
    replaceImageMedia,
    uploadImageMedia,
    uploadProjectImage,
} from '../controllers/mediaController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
});

const adminOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.get('/admin/media', adminOnly, asyncHandler(getAdminMedia));
router.post('/admin/media/images', adminOnly, upload.single('image'), asyncHandler(uploadImageMedia));
router.put('/admin/media/:id/replace', adminOnly, upload.single('image'), asyncHandler(replaceImageMedia));
router.delete('/admin/media/:id', adminOnly, asyncHandler(deleteImageMedia));

// Backward-compatible project image endpoint for existing admin screens.
router.post('/admin/projects/images', adminOnly, upload.single('image'), asyncHandler(uploadProjectImage));

export default router;

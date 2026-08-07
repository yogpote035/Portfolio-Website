import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createNewSkill,
    deleteSkill,
    getAdminSkills,
    getSkills,
    updateSkill,
} from '../controllers/skillController.js';
import { validate } from '../middleware/validate.js';
import { skillSchema, skillUpdateSchema } from '../validators/skillSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/skills', asyncHandler(getSkills));
router.get('/admin/skills', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(getAdminSkills));
router.post('/admin/skills', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillSchema), asyncHandler(createNewSkill));
router.put('/admin/skills/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillUpdateSchema), asyncHandler(updateSkill));
router.delete('/admin/skills/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(deleteSkill));

export default router;

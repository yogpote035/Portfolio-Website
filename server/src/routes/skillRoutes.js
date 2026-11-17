import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
    createNewSkill,
    deleteSkill,
    getAdminSkills,
    getSkills,
    getSkillCategories,
    createNewSkillCategory,
    updateExistingSkillCategory,
    removeSkillCategory,
    updateSkill,
} from '../controllers/skillController.js';
import { validate } from '../middleware/validate.js';
import { skillSchema, skillUpdateSchema } from '../validators/skillSchemas.js';
import { skillCategorySchema, skillCategoryUpdateSchema } from '../validators/skillCategorySchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/skills', asyncHandler(getSkills));
router.get('/skill-categories', asyncHandler(getSkillCategories));
router.get('/admin/skills', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(getAdminSkills));
router.get('/admin/skill-categories', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler((req, res, next) => { req.adminCategories = true; return getSkillCategories(req, res, next); }));
router.post('/admin/skill-categories', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillCategorySchema), asyncHandler(createNewSkillCategory));
router.put('/admin/skill-categories/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillCategoryUpdateSchema), asyncHandler(updateExistingSkillCategory));
router.delete('/admin/skill-categories/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(removeSkillCategory));
router.post('/admin/skills', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillSchema), asyncHandler(createNewSkill));
router.put('/admin/skills/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(skillUpdateSchema), asyncHandler(updateSkill));
router.delete('/admin/skills/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), asyncHandler(deleteSkill));

export default router;

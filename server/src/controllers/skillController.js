import { sendSuccess } from '../utils/apiResponse.js';
import {
    createSkill,
    deleteSkillById,
    findSkillById,
    findSkills,
    updateSkillById,
} from '../models/skillModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import { recordContentVersion } from '../services/contentVersion.service.js';
import { createSkillCategory, deleteSkillCategory, findSkillCategories, updateSkillCategory } from '../models/skillCategoryModel.js';

export async function getSkills(req, res) {
    const skills = await findSkills();
    return sendSuccess(res, 'Skills fetched successfully', skills);
}

export async function getAdminSkills(req, res) {
    const skills = await findSkills(true);
    return sendSuccess(res, 'Admin skills fetched successfully', skills);
}

export async function getSkillCategories(req, res) {
    return sendSuccess(res, 'Skill categories fetched successfully', await findSkillCategories(Boolean(req.adminCategories)));
}

export async function createNewSkillCategory(req, res) {
    let category;
    try {
        category = await createSkillCategory(req.validated.body);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const duplicate = new Error('A category with this slug already exists. Choose a different slug.');
            duplicate.statusCode = 409;
            duplicate.code = 'CATEGORY_SLUG_EXISTS';
            duplicate.errors = { slug: 'This slug is already in use.' };
            throw duplicate;
        }
        throw error;
    }
    return sendSuccess(res, 'Skill category created successfully', category, 201);
}

export async function updateExistingSkillCategory(req, res) {
    const current = (await findSkillCategories(true)).find((item) => String(item.id) === String(req.params.id));
    if (!current) { const error = new Error('Skill category not found'); error.statusCode = 404; throw error; }
    const category = await updateSkillCategory(req.params.id, { ...current, ...req.validated.body });
    return sendSuccess(res, 'Skill category updated successfully', category);
}

export async function removeSkillCategory(req, res) {
    const deleted = await deleteSkillCategory(req.params.id);
    if (!deleted) { const error = new Error('Skill category not found'); error.statusCode = 404; throw error; }
    return sendSuccess(res, 'Skill category deleted successfully');
}

export async function createNewSkill(req, res) {
    const skillData = req.validated.body;
    const skill = await createSkill(skillData);
    await recordContentVersion(req, 'skill', skill.id, `Skill created: ${skill.name}`);
    await logAdminActivity(req, {
        action: 'skill.created',
        entityType: 'skill',
        entityId: skill.id,
        description: `Skill created: ${skill.name}`,
        metadata: { category: skill.category },
    });
    return sendSuccess(res, 'Skill created successfully', skill, 201);
}

export async function updateSkill(req, res) {
    const { id } = req.params;
    const existing = await findSkillById(id);

    if (!existing) {
        const error = new Error('Skill not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateSkillById(id, { ...existing, ...req.validated.body });
    await recordContentVersion(req, 'skill', updated.id, `Skill saved: ${updated.name}`);
    await logAdminActivity(req, {
        action: 'skill.updated',
        entityType: 'skill',
        entityId: updated.id,
        description: `Skill updated: ${updated.name}`,
        metadata: { category: updated.category, isActive: Boolean(updated.is_active) },
    });
    return sendSuccess(res, 'Skill updated successfully', updated);
}

export async function deleteSkill(req, res) {
    const { id } = req.params;
    const existing = await findSkillById(id);

    if (!existing) {
        const error = new Error('Skill not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteSkillById(id);
    await logAdminActivity(req, {
        action: 'skill.deleted',
        entityType: 'skill',
        entityId: existing.id,
        description: `Skill deleted: ${existing.name}`,
        metadata: { category: existing.category },
    });
    return sendSuccess(res, 'Skill deleted successfully');
}

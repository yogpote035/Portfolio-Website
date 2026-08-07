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

export async function getSkills(req, res) {
    const skills = await findSkills();
    return sendSuccess(res, 'Skills fetched successfully', skills);
}

export async function getAdminSkills(req, res) {
    const skills = await findSkills(true);
    return sendSuccess(res, 'Admin skills fetched successfully', skills);
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

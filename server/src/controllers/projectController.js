import { sendSuccess } from '../utils/apiResponse.js';
import {
    createProject,
    deleteProjectById,
    findProjectById,
    findProjectBySlug,
    findProjectGallery,
    findProjectTechnologies,
    findProjects,
    updateProjectById,
} from '../models/projectModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import { recordContentVersion } from '../services/contentVersion.service.js';

export async function getProjects(req, res) {
    const projects = await findProjects();
    return sendSuccess(res, 'Projects fetched successfully', projects);
}

export async function getProjectBySlug(req, res) {
    const { slug } = req.params;
    const project = await findProjectBySlug(slug);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    const gallery = await findProjectGallery(project.id);
    const technologies = await findProjectTechnologies(project.id);

    return sendSuccess(res, 'Project fetched successfully', {
        ...project,
        gallery,
        technologies,
    });
}

export async function getAdminProjects(req, res) {
    const projects = await findProjects({ includeArchived: true });
    const projectsWithRelations = await Promise.all(
        projects.map(async (project) => ({
            ...project,
            gallery: await findProjectGallery(project.id),
            technologies: await findProjectTechnologies(project.id),
        })),
    );

    return sendSuccess(res, 'Admin projects fetched successfully', projectsWithRelations);
}

export async function createNewProject(req, res) {
    const projectData = req.validated.body;
    const project = await createProject(projectData);
    await recordContentVersion(req, 'project', project.id, `Project created: ${project.name}`);
    await logAdminActivity(req, {
        action: 'project.created',
        entityType: 'project',
        entityId: project.id,
        description: `Project created: ${project.name}`,
        metadata: { slug: project.slug, status: project.status },
    });
    return sendSuccess(res, 'Project created successfully', project, 201);
}

export async function updateProject(req, res) {
    const { id } = req.params;
    const existing = await findProjectById(id);

    if (!existing) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateProjectById(id, { ...existing, ...req.validated.body });
    await recordContentVersion(req, 'project', updated.id, `Project saved: ${updated.name}`);
    await logAdminActivity(req, {
        action: 'project.updated',
        entityType: 'project',
        entityId: updated.id,
        description: `Project updated: ${updated.name}`,
        metadata: { slug: updated.slug, status: updated.status },
    });
    return sendSuccess(res, 'Project updated successfully', updated);
}

export async function deleteProject(req, res) {
    const { id } = req.params;
    const existing = await findProjectById(id);

    if (!existing) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteProjectById(id);
    await logAdminActivity(req, {
        action: 'project.deleted',
        entityType: 'project',
        entityId: existing.id,
        description: `Project deleted: ${existing.name}`,
        metadata: { slug: existing.slug },
    });
    return sendSuccess(res, 'Project deleted successfully');
}

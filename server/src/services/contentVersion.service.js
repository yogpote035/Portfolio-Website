import { findContentVersionById, createContentVersion } from '../models/contentVersionModel.js';
import { findProfile, getSocialLinks, getHeroRoles, getPortfolioStats, updateProfileRow, replaceSocialLinks, replaceHeroRoles, replacePortfolioStats } from '../models/profileModel.js';
import { findSkillById, updateSkillById } from '../models/skillModel.js';
import { findExperienceById, updateExperienceById } from '../models/experienceModel.js';
import { findEducationById, updateEducationById } from '../models/educationModel.js';
import { findProjectById, findProjectGallery, findProjectTechnologies, updateProjectById } from '../models/projectModel.js';

const supportedTypes = new Set(['profile', 'project', 'skill', 'experience', 'education']);

function parseArray(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try { return JSON.parse(value); } catch { return []; }
}

function withId(snapshot, entityId) {
    return { ...snapshot, id: entityId };
}

export function isVersionableEntityType(entityType) {
    return supportedTypes.has(entityType);
}

export async function getContentSnapshot(entityType, entityId) {
    if (!isVersionableEntityType(entityType)) throw new Error('Unsupported versioned content type');

    if (entityType === 'profile') {
        const profile = await findProfile();
        if (!profile) return null;
        const [socials, roles, stats] = await Promise.all([
            getSocialLinks(profile.id), getHeroRoles(profile.id), getPortfolioStats(profile.id),
        ]);
        return {
            id: profile.id, name: profile.name, designation: profile.designation,
            cover_photo_media_id: profile.cover_photo_media_id, about: profile.about,
            email: profile.email, phone: profile.phone, location: profile.location, socials,
            typingRoles: roles.map((item) => item.role),
            stats: stats.map(({ label, value, displayOrder }) => ({ label, value, display_order: displayOrder })),
        };
    }
    if (entityType === 'skill') return findSkillById(entityId);
    if (entityType === 'experience') {
        const item = await findExperienceById(entityId);
        return item && { ...item, responsibilities: parseArray(item.responsibilities), technologies: parseArray(item.technologies) };
    }
    if (entityType === 'education') {
        const item = await findEducationById(entityId);
        return item && { ...item, coursework: parseArray(item.coursework) };
    }

    const project = await findProjectById(entityId);
    if (!project) return null;
    const [gallery, technologies] = await Promise.all([findProjectGallery(entityId), findProjectTechnologies(entityId)]);
    return {
        ...project,
        technologyIds: technologies.map((technology) => technology.id),
        galleryImages: gallery.map((image) => ({ mediaId: image.mediaId, altText: image.altText, displayOrder: image.displayOrder })),
    };
}

export async function recordContentVersion(req, entityType, entityId, summary) {
    const snapshot = await getContentSnapshot(entityType, entityId);
    if (!snapshot) return null;
    return createContentVersion({ entityType, entityId, snapshot, summary, createdBy: req.user?.id });
}

export async function restoreContentVersion(versionId) {
    const version = await findContentVersionById(versionId);
    if (!version) return null;
    const snapshot = typeof version.snapshot === 'string' ? JSON.parse(version.snapshot) : version.snapshot;
    const current = await getContentSnapshot(version.entityType, version.entityId);
    if (!current) throw new Error('The current content record no longer exists');

    if (version.entityType === 'profile') {
        await updateProfileRow(version.entityId, withId(snapshot, version.entityId));
        await replaceSocialLinks(version.entityId, snapshot.socials || []);
        await replaceHeroRoles(version.entityId, snapshot.typingRoles || []);
        await replacePortfolioStats(version.entityId, snapshot.stats || []);
    } else if (version.entityType === 'skill') {
        await updateSkillById(version.entityId, withId(snapshot, version.entityId));
    } else if (version.entityType === 'experience') {
        await updateExperienceById(version.entityId, withId(snapshot, version.entityId));
    } else if (version.entityType === 'education') {
        await updateEducationById(version.entityId, withId(snapshot, version.entityId));
    } else if (version.entityType === 'project') {
        await updateProjectById(version.entityId, withId(snapshot, version.entityId));
    }

    return { version, current };
}

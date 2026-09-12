import { sendSuccess } from '../utils/apiResponse.js';
import {
    findProfile,
    getHeroRoles,
    getPortfolioStats,
    getSocialLinks,
    replaceHeroRoles,
    replacePortfolioStats,
    replaceSocialLinks,
    updateProfileRow,
} from '../models/profileModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import { recordContentVersion } from '../services/contentVersion.service.js';

function formatProfile(profile) {
    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        name: profile.name,
        designation: profile.designation,
        coverPhotoMediaId: profile.cover_photo_media_id,
        coverPhotoUrl: profile.cover_photo_url,
        aboutImageMediaId: profile.about_image_media_id,
        aboutImageUrl: profile.about_image_url,
        about: profile.about,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
    };
}

export async function getProfile(req, res) {
    const profile = await findProfile();

    if (!profile) {
        return sendSuccess(res, 'Profile not found', null, 404);
    }

    const socials = await getSocialLinks(profile.id);
    const roles = await getHeroRoles(profile.id);
    const stats = await getPortfolioStats(profile.id);
    const formattedProfile = formatProfile(profile);

    return sendSuccess(res, 'Profile fetched successfully', {
        ...formattedProfile,
        socials,
        typingRoles: roles.map((item) => item.role).filter((role) => typeof role === 'string' && role.trim().length > 0),
        stats,
    });
}

export async function updateProfile(req, res) {
    const profile = await findProfile();
    const profileData = req.validated.body;

    if (!profile) {
        const error = new Error('Profile not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateProfileRow(profile.id, profileData);
    if (Array.isArray(profileData.socials)) {
        await replaceSocialLinks(profile.id, profileData.socials);
    }
    if (Array.isArray(profileData.typingRoles)) {
        await replaceHeroRoles(profile.id, profileData.typingRoles.map((role, index) => ({ role, display_order: index + 1 })));
    }
    if (Array.isArray(profileData.stats)) {
        await replacePortfolioStats(profile.id, profileData.stats);
    }

    await recordContentVersion(req, 'profile', profile.id, `Profile saved: ${updated.name}`);

    await logAdminActivity(req, {
        action: 'profile.updated',
        entityType: 'profile',
        entityId: profile.id,
        description: `Profile updated for ${updated.name}`,
        metadata: { name: updated.name },
    });

    return sendSuccess(res, 'Profile updated successfully', updated);
}

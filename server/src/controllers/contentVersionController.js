import { sendSuccess } from '../utils/apiResponse.js';
import { findContentVersionById, findContentVersions } from '../models/contentVersionModel.js';
import { isVersionableEntityType, recordContentVersion, restoreContentVersion } from '../services/contentVersion.service.js';
import { logAdminActivity } from '../utils/activityLogger.js';

export async function getContentVersions(req, res) {
    const { entityType, entityId } = req.query;
    if (!isVersionableEntityType(entityType) || !Number.isInteger(Number(entityId))) {
        const error = new Error('A valid entityType and entityId are required');
        error.statusCode = 400;
        throw error;
    }
    return sendSuccess(res, 'Content history fetched successfully', await findContentVersions(entityType, Number(entityId)));
}

export async function restoreVersion(req, res) {
    const sourceVersion = await findContentVersionById(req.params.id);
    if (!sourceVersion) {
        const error = new Error('Content version not found');
        error.statusCode = 404;
        throw error;
    }

    const backupVersion = await recordContentVersion(
        req,
        sourceVersion.entityType,
        sourceVersion.entityId,
        `Before restoring version ${sourceVersion.versionNumber}`,
    );
    const restored = await restoreContentVersion(sourceVersion.id);
    await logAdminActivity(req, {
        action: 'content.restored', entityType: restored.version.entityType, entityId: restored.version.entityId,
        description: `Restored ${restored.version.entityType} from version ${restored.version.versionNumber}`,
        metadata: { sourceVersionId: restored.version.id, backupVersionId: backupVersion?.id },
    });
    return sendSuccess(res, 'Content version restored successfully', { backupVersion });
}

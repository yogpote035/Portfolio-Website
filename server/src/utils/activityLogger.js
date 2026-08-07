import { createActivityLog } from '../models/activityLogModel.js';

export async function logAdminActivity(req, activity) {
    try {
        await createActivityLog({
            adminId: req.user?.id || null,
            ...activity,
        });
    } catch (error) {
        console.warn('[activity-log] Failed to write activity log:', error.message);
    }
}

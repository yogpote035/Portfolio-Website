import { sendSuccess } from '../utils/apiResponse.js';
import {
    createContact,
    deleteContactById,
    findContactById,
    findContacts,
    updateContactById,
} from '../models/contactModel.js';
import { logAdminActivity } from '../utils/activityLogger.js';

export async function submitContact(req, res) {
    const contactData = req.validated.body;
    const contact = await createContact(contactData);
    return sendSuccess(res, 'Contact message submitted successfully', contact, 201);
}

export async function getAdminContacts(req, res) {
    const parsedPage = Number.parseInt(req.query.page ?? 1, 10);
    const parsedLimit = Number.parseInt(req.query.limit ?? 20, 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
    const status = req.query.status;
    const starred = req.query.starred === 'true' ? true : req.query.starred === 'false' ? false : undefined;
    const search = req.query.search || null;

    const { rows, count } = await findContacts({ status, starred, search, page, limit });
    return sendSuccess(res, 'Contacts fetched successfully', { data: rows, page, limit, total: count });
}

export async function getAdminContact(req, res) {
    const { id } = req.params;
    const contact = await findContactById(id);

    if (!contact) {
        const error = new Error('Contact message not found');
        error.statusCode = 404;
        throw error;
    }

    return sendSuccess(res, 'Contact fetched successfully', contact);
}

export async function updateContact(req, res) {
    const { id } = req.params;
    const existing = await findContactById(id);

    if (!existing) {
        const error = new Error('Contact message not found');
        error.statusCode = 404;
        throw error;
    }

    const updated = await updateContactById(id, { ...existing, ...req.validated.body });
    await logAdminActivity(req, {
        action: 'contact.updated',
        entityType: 'contact',
        entityId: updated.id,
        description: `Contact updated: ${updated.subject}`,
        metadata: { status: updated.status, isStarred: Boolean(updated.is_starred) },
    });
    return sendSuccess(res, 'Contact updated successfully', updated);
}

export async function deleteContact(req, res) {
    const { id } = req.params;
    const existing = await findContactById(id);

    if (!existing) {
        const error = new Error('Contact message not found');
        error.statusCode = 404;
        throw error;
    }

    await deleteContactById(id);
    await logAdminActivity(req, {
        action: 'contact.deleted',
        entityType: 'contact',
        entityId: existing.id,
        description: `Contact deleted: ${existing.subject}`,
        metadata: { email: existing.email },
    });
    return sendSuccess(res, 'Contact deleted successfully');
}

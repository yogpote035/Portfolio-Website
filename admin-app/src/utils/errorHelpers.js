export function normalizeValidationKey(key) {
    if (typeof key !== 'string') {
        return key;
    }

    return key.replace(/^body\./, '').replace(/^data\./, '').replace(/^params\./, '');
}

export function parseValidationErrors(error) {
    const parsed = {
        fieldErrors: {},
        message: error?.message || '',
    };

    const validationPayload = error?.errors;
    if (!validationPayload || typeof validationPayload !== 'object') {
        return parsed;
    }

    if (Array.isArray(validationPayload.formErrors) && validationPayload.formErrors.length > 0) {
        parsed.message = validationPayload.formErrors.filter(Boolean).join(' ');
    }

    const fieldErrors = validationPayload.fieldErrors || validationPayload;
    if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([key, value]) => {
            const normalizedKey = normalizeValidationKey(key);
            if (Array.isArray(value) && value.length > 0) {
                parsed.fieldErrors[normalizedKey] = value.filter(Boolean).join(' ');
            } else if (value) {
                parsed.fieldErrors[normalizedKey] = String(value);
            }
        });
    }

    return parsed;
}

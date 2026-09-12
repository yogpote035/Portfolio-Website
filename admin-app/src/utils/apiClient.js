export const apiBase = import.meta.env?.VITE_API_BASE_URL || '';

export async function fetchApi(path) {
    const response = await fetch(`${apiBase}${path}`);

    const text = await response.text();
    let payload = null;

    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            if (!response.ok) {
                const error = new Error(response.statusText || `Request failed with status ${response.status}`);
                throw error;
            }
            throw new Error('Invalid API response format');
        }
    }

    if (!response.ok) {
        const error = new Error(payload?.message || response.statusText || `Request failed with status ${response.status}`);
        error.errors = payload?.errors || null;
        throw error;
    }

    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid API response');
    }

    if (!payload.success) {
        const error = new Error(payload.message || 'API request failed');
        error.errors = payload.errors || null;
        throw error;
    }

    return payload.data;
}

import { apiBase } from './apiClient.js';

const ACCESS_TOKEN_KEY = 'portfolio_admin_access_token';
const REFRESH_TOKEN_KEY = 'portfolio_admin_refresh_token';
let refreshPromise = null;

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens({ accessToken, refreshToken }) {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function clearAuthTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
    return Boolean(getAccessToken());
}

function isTokenExpiring(token, bufferSeconds = 30) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return !payload.exp || payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
    } catch {
        return true;
    }
}

async function parseApiResponse(response) {
    const text = await response.text();

    if (!text) {
        if (!response.ok) {
            const error = new Error(response.statusText || `Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return null;
    }

    let payload;
    try {
        payload = JSON.parse(text);
    } catch {
        if (!response.ok) {
            const error = new Error(response.statusText || `Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }
        throw new Error('Invalid API response format');
    }

    if (!response.ok) {
        const error = new Error(payload?.message || response.statusText || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = payload?.errors || null;
        throw error;
    }

    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid API response format');
    }

    if (!payload.success) {
        const error = new Error(payload.message || 'API request failed');
        error.errors = payload.errors || null;
        throw error;
    }

    return payload;
}

function buildAuthHeaders(token, additionalHeaders = {}, isFormData = false) {
    return {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...additionalHeaders,
    };
}

export async function login({ email, password }) {
    const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const payload = await parseApiResponse(response);

    if (!response.ok) {
        throw new Error(payload?.message || response.statusText || 'Login failed');
    }

    if (!payload.success) {
        throw new Error(payload.message || 'Login failed');
    }

    setAuthTokens(payload.data);
    return payload.data;
}

async function performTokenRefresh() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error('Refresh token unavailable');
    }

    const response = await fetch(`${apiBase}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    const payload = await parseApiResponse(response);

    if (!response.ok || !payload.success) {
        clearAuthTokens();
        throw new Error(payload?.message || 'Unable to refresh authentication');
    }

    setAuthTokens(payload.data);
    return payload.data;
}

export function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

export async function logout() {
    const token = getAccessToken();
    clearAuthTokens();

    if (!token) {
        return;
    }

    await fetch(`${apiBase}/api/auth/logout`, {
        method: 'POST',
        headers: buildAuthHeaders(token),
    }).catch(() => {
        // Ignore logout failures; client-side state is already cleared.
    });
}

export async function fetchApiAuth(path, options = {}) {
    let token = getAccessToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    if (isTokenExpiring(token)) {
        try {
            token = (await refreshAccessToken()).accessToken;
        } catch (error) {
            clearAuthTokens();
            throw error;
        }
    }

    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: buildAuthHeaders(token, options.headers, isFormData),
    });

    if (response.status === 401) {
        try {
            const refreshed = await refreshAccessToken();
            token = refreshed.accessToken;
        } catch (error) {
            clearAuthTokens();
            throw error;
        }

        const retryResponse = await fetch(`${apiBase}${path}`, {
            ...options,
            headers: buildAuthHeaders(token, options.headers, isFormData),
        });

        const retryPayload = await parseApiResponse(retryResponse);
        return retryPayload.data;
    }

    const payload = await parseApiResponse(response);
    return payload.data;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheGet, cacheSet, buildCacheKey, cacheInvalidatePrefix } from './listingsCache';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Change this to your deployed Cloudflare Worker URL after running `npm run deploy`
// For local backend dev: 'http://localhost:8787'
export const API_BASE_URL = 'https://houserent-backend.nkingsap.workers.dev';

let authToken = null;
let refreshToken = null;

/**
 * Configure global auth tokens for API calls.
 */
export const setAuthTokens = (token, refresh) => {
    authToken = token;
    refreshToken = refresh;
};

// ─── Generic request helper ───────────────────────────────────────────────────
async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    
    // Set headers
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    let res = await fetch(url, {
        ...options,
        headers,
    });

    // Handle token expiration (401 Unauthorized) and attempt automatic refresh
    if (res.status === 401 && refreshToken && path !== '/api/auth/login' && path !== '/api/auth/register' && path !== '/api/auth/refresh') {
        try {
            // Call refresh endpoint to get new tokens
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                authToken = refreshData.access_token;
                refreshToken = refreshData.refresh_token;

                // Update stored session with new tokens
                const rawUser = await AsyncStorage.getItem('@renthub_current_user');
                if (rawUser) {
                    const session = JSON.parse(rawUser);
                    session.access_token = authToken;
                    session.refresh_token = refreshToken;
                    session.user = refreshData.user;
                    await AsyncStorage.setItem('@renthub_current_user', JSON.stringify(session));
                }

                // Retry original request with new token
                headers['Authorization'] = `Bearer ${authToken}`;
                res = await fetch(url, {
                    ...options,
                    headers,
                });
            }
        } catch (e) {
            console.error('Failed to auto-refresh token:', e);
            // Session expired, clear state
            authToken = null;
            refreshToken = null;
            await AsyncStorage.removeItem('@renthub_current_user');
        }
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiRegister = (payload) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const apiLogin = (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiLogout = () =>
    request('/api/auth/logout', { method: 'POST' });

// ─── Listings ─────────────────────────────────────────────────────────────────

/**
 * Build a Supabase Image Transform thumbnail URL from a full-size image URL.
 * Appends width/height/quality/resize transform params for card/list views.
 * @param {string} url - Full-size Supabase Storage public URL
 * @param {number} width - Target width (default 400)
 * @param {number} height - Target height (default 300)
 * @returns {string} Transformed URL for the resized thumbnail
 */
export const getThumbnailUrl = (url, width = 400, height = 300) => {
    if (!url) return url;
    // Supabase Storage transform: /render/image/public → /render/image/public?width=...
    // For standard public URLs: add /render/image transform path
    try {
        const u = new URL(url);
        u.searchParams.set('width', String(width));
        u.searchParams.set('height', String(height));
        u.searchParams.set('resize', 'cover');
        u.searchParams.set('quality', '75');
        return u.toString();
    } catch {
        return url; // fallback if URL is invalid
    }
};

export const apiGetListings = (params = {}) => {
    const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    const path = `/api/listings${qs ? '?' + qs : ''}`;
    const cacheKey = buildCacheKey('/api/listings', params);

    // Return cached data immediately if available
    const cached = cacheGet(cacheKey);
    if (cached && cached.isFresh) {
        return Promise.resolve(cached.data);
    }

    // Fetch fresh data (cache-miss or stale)
    return request(path).then((data) => {
        cacheSet(cacheKey, data);
        return data;
    });
};

export const apiGetListingsByOwner = (ownerId) =>
    request(`/api/listings/owner/${ownerId}`);

export const apiGetNearbyListings = (lat, lng, radius = 10) =>
    request(`/api/listings/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

export const apiCreateListing = (payload) =>
    request('/api/listings', { method: 'POST', body: JSON.stringify(payload) });

export const apiUpdateListing = (id, payload) =>
    request(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const apiDeleteListing = (id) =>
    request(`/api/listings/${id}`, { method: 'DELETE' });

// ─── Image Upload ─────────────────────────────────────────────────────────────
/**
 * Upload a single image to Supabase Storage via the backend.
 * @param {string} localUri - The local file:// URI from expo-image-picker
 * @returns {Promise<string>} - The public HTTPS URL stored in the DB
 */
export async function apiUploadImage(localUri) {
    const url = `${API_BASE_URL}/api/upload/image`;

    const formData = new FormData();
    const filename = localUri.split('/').pop();
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const type = ext === 'png' ? 'image/png' : 'image/jpeg';

    formData.append('file', { uri: localUri, name: filename, type });

    const headers = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, { method: 'POST', body: formData, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data.url;
}

// ─── Maps / Geocoding ─────────────────────────────────────────────────────────
export const apiGeocode = (address) =>
    request(`/api/maps/geocode?address=${encodeURIComponent(address)}`);

// ─── Favorites ────────────────────────────────────────────────────────────────
export const apiGetFavorites = (userId) => {
    const cacheKey = `favorites:${userId}`;
    const cached = cacheGet(cacheKey);
    if (cached && cached.isFresh) {
        return Promise.resolve(cached.data);
    }
    return request(`/api/favorites/${userId}`).then((data) => {
        cacheSet(cacheKey, data, 120_000); // 2 min TTL for favorites
        return data;
    });
};

export const apiGetFavoriteListings = (userId) =>
    request(`/api/listings/favorites/${userId}`);

export const apiToggleFavorite = (userId, listingId) => {
    // Invalidate favorites cache on toggle so next read is fresh
    cacheInvalidatePrefix('favorites:');
    return request('/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId }), // Server extracts userId from JWT
    });
};


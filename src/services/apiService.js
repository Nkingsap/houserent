// ─── Base URL ─────────────────────────────────────────────────────────────────
// Change this to your deployed Cloudflare Worker URL after running `npm run deploy`
// For local backend dev: 'http://localhost:8787'
export const API_BASE_URL = 'https://houserent-backend.nkingsap.workers.dev';

// ─── Generic request helper ───────────────────────────────────────────────────
async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

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

// ─── Listings ─────────────────────────────────────────────────────────────────
export const apiGetListings = (params = {}) => {
    const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    return request(`/api/listings${qs ? '?' + qs : ''}`);
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

    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data.url;
}

// ─── Maps / Geocoding ─────────────────────────────────────────────────────────
export const apiGeocode = (address) =>
    request(`/api/maps/geocode?address=${encodeURIComponent(address)}`);

// ─── Favorites ────────────────────────────────────────────────────────────────
export const apiGetFavorites = (userId) =>
    request(`/api/favorites/${userId}`);

export const apiGetFavoriteListings = (userId) =>
    request(`/api/listings/favorites/${userId}`);

export const apiToggleFavorite = (userId, listingId) =>
    request('/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, listing_id: listingId }),
    });

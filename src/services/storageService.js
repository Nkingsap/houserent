import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    USERS: '@rentapp_users',
    LISTINGS: '@rentapp_listings',
    CURRENT_USER: '@rentapp_current_user',
    FAVORITES: '@rentapp_favorites',
    SEEDED: '@rentapp_seeded',
};

// ─── Generic helpers ──────────────────────────
const getJSON = async (key) => {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error('Storage read error', e);
        return null;
    }
};

const setJSON = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage write error', e);
    }
};

// ─── Users ────────────────────────────────────
export const getUsers = async () => (await getJSON(KEYS.USERS)) || [];

export const saveUser = async (user) => {
    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    await setJSON(KEYS.USERS, users);
};

export const findUserByEmail = async (email) => {
    const users = await getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// ─── Auth / Session ───────────────────────────
export const setCurrentUser = async (user) => setJSON(KEYS.CURRENT_USER, user);
export const getCurrentUser = async () => getJSON(KEYS.CURRENT_USER);
export const clearCurrentUser = async () => AsyncStorage.removeItem(KEYS.CURRENT_USER);

// ─── Listings ─────────────────────────────────
export const getListings = async () => (await getJSON(KEYS.LISTINGS)) || [];

export const saveListing = async (listing) => {
    const listings = await getListings();
    const idx = listings.findIndex((l) => l.id === listing.id);
    if (idx >= 0) listings[idx] = listing;
    else listings.push(listing);
    await setJSON(KEYS.LISTINGS, listings);
};

export const deleteListing = async (id) => {
    let listings = await getListings();
    listings = listings.filter((l) => l.id !== id);
    await setJSON(KEYS.LISTINGS, listings);
};

export const getListingsByOwner = async (ownerId) => {
    const listings = await getListings();
    return listings.filter((l) => l.ownerId === ownerId);
};

export const searchListings = async (query = '', filters = {}) => {
    let listings = await getListings();

    if (query) {
        const q = query.toLowerCase();
        listings = listings.filter(
            (l) =>
                l.title.toLowerCase().includes(q) ||
                l.address.toLowerCase().includes(q) ||
                l.city.toLowerCase().includes(q)
        );
    }

    if (filters.minPrice) listings = listings.filter((l) => l.price >= filters.minPrice);
    if (filters.maxPrice) listings = listings.filter((l) => l.price <= filters.maxPrice);
    if (filters.bedrooms) listings = listings.filter((l) => l.bedrooms >= filters.bedrooms);
    if (filters.bathrooms) listings = listings.filter((l) => l.bathrooms >= filters.bathrooms);
    if (filters.type) listings = listings.filter((l) => l.type === filters.type);

    return listings;
};

// ─── Favorites ────────────────────────────────
export const getFavorites = async (userId) => {
    const all = (await getJSON(KEYS.FAVORITES)) || {};
    return all[userId] || [];
};

export const toggleFavorite = async (userId, listingId) => {
    const all = (await getJSON(KEYS.FAVORITES)) || {};
    const userFavs = all[userId] || [];
    const idx = userFavs.indexOf(listingId);
    if (idx >= 0) userFavs.splice(idx, 1);
    else userFavs.push(listingId);
    all[userId] = userFavs;
    await setJSON(KEYS.FAVORITES, all);
    return userFavs;
};

export const isFavorite = async (userId, listingId) => {
    const favs = await getFavorites(userId);
    return favs.includes(listingId);
};

// ─── Seed check ───────────────────────────────
export const hasSeeded = async () => {
    const val = await AsyncStorage.getItem(KEYS.SEEDED);
    return val === 'true';
};

export const markSeeded = async () => {
    await AsyncStorage.setItem(KEYS.SEEDED, 'true');
};

// ─── Reset (dev) ──────────────────────────────
export const resetAll = async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
};

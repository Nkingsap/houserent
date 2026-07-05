/**
 * Simple in-memory cache with TTL for API responses.
 * Implements stale-while-revalidate pattern:
 *   - Returns cached data immediately if available (even if stale)
 *   - Caller can check isFresh to decide whether to revalidate in background
 */

const DEFAULT_TTL = 60_000; // 60 seconds

const store = new Map(); // key → { data, timestamp, ttl }

/**
 * Get cached data for a key.
 * @returns {{ data: any, isFresh: boolean } | null}
 */
export function cacheGet(key) {
    const entry = store.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    return {
        data: entry.data,
        isFresh: age < entry.ttl,
    };
}

/**
 * Store data in the cache.
 */
export function cacheSet(key, data, ttl = DEFAULT_TTL) {
    store.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Invalidate a specific cache key.
 */
export function cacheInvalidate(key) {
    store.delete(key);
}

/**
 * Invalidate all keys matching a prefix.
 * e.g., cacheInvalidatePrefix('listings') clears all listings-related cache entries.
 */
export function cacheInvalidatePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
            store.delete(key);
        }
    }
}

/**
 * Clear entire cache.
 */
export function cacheClear() {
    store.clear();
}

/**
 * Build a stable cache key from path + params.
 */
export function buildCacheKey(path, params = {}) {
    const sorted = Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    return sorted ? `${path}?${sorted}` : path;
}

const keyPrefix = 'planner-program-v1:';
// The API sends no cache headers, so keep this short in line with the course cache
const cacheLifetime = 5 * 60 * 1000;

const inflight = new Map<string, Promise<string>>();

/**
 * Cache for public program data (specializations, major/minor requirements), keyed by the request. Callers mutate
 * these results (renaming, sorting, appending), so each caller gets its own copy.
 */
export async function cachedProgramQuery<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    let pending = inflight.get(key);
    if (!pending) {
        pending = loadSerialized(key, fetcher).finally(() => inflight.delete(key));
        inflight.set(key, pending);
    }
    return JSON.parse(await pending) as T;
}

async function loadSerialized<T>(key: string, fetcher: () => Promise<T>): Promise<string> {
    try {
        const cached = JSON.parse(sessionStorage.getItem(keyPrefix + key) ?? 'null');
        if (cached && cached.expiresAt > Date.now() && typeof cached.value === 'string') return cached.value;
    } catch {
        // Corrupt or unavailable storage must not prevent loading.
    }

    const value = JSON.stringify(await fetcher());
    try {
        sessionStorage.setItem(keyPrefix + key, JSON.stringify({ expiresAt: Date.now() + cacheLifetime, value }));
    } catch {
        // Storage may be disabled or full; the fresh response is still usable.
    }
    return value;
}

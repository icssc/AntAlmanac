// Copies of a logged-in user's server data (selected majors/minors), used only to show something before the server
// responds. Each user has their own entry, so accounts never see or overwrite each other's, and the server copy always
// replaces it once it arrives.
const keyPrefix = 'planner-user-snapshot-v1:';

const storageKey = (name: string, userKey: string) => `${keyPrefix}${name}:${userKey}`;

export function readUserSnapshot<T>(name: string, userKey: string): T | null {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey(name, userKey)) ?? 'null');
        if (stored?.userKey === userKey && stored.data != null) return stored.data as T;
    } catch {
        // Unavailable or corrupt storage just means no snapshot.
    }
    return null;
}

export function writeUserSnapshot<T>(name: string, userKey: string, data: T) {
    try {
        localStorage.setItem(storageKey(name, userKey), JSON.stringify({ userKey, data }));
    } catch {
        // Storage may be full or disabled.
    }
}

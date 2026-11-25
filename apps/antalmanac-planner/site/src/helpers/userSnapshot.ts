// Copies of a logged-in user's server data (transfer credits, selected majors/minors), used only to show something
// before the server responds. Each is keyed by the user so another account never sees it, and the server copy always
// replaces it once it arrives.
const keyPrefix = 'planner-user-snapshot-v1:';

export function readUserSnapshot<T>(name: string, userKey: string): T | null {
    try {
        const stored = JSON.parse(localStorage.getItem(keyPrefix + name) ?? 'null');
        if (stored?.userKey === userKey && stored.data != null) return stored.data as T;
    } catch {
        // Unavailable or corrupt storage just means no snapshot.
    }
    return null;
}

export function writeUserSnapshot<T>(name: string, userKey: string, data: T) {
    try {
        localStorage.setItem(keyPrefix + name, JSON.stringify({ userKey, data }));
    } catch {
        // Storage may be full or disabled.
    }
}

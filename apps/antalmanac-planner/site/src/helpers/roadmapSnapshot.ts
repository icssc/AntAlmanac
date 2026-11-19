import { SavedRoadmap } from '@peterportal/types';

const snapshotKey = 'planner-account-roadmap-snapshot-v1';

// A copy of the last account roadmap fetched from the server, used only to paint the planner before the
// server responds. The server copy always replaces it, and it is dropped whenever a save succeeds.
export function readRoadmapSnapshot(userKey: string): SavedRoadmap | null {
    try {
        const snapshot = JSON.parse(localStorage.getItem(snapshotKey) ?? 'null');
        if (snapshot?.userKey === userKey && Array.isArray(snapshot.roadmap?.planners)) return snapshot.roadmap;
    } catch {
        // Unavailable or corrupt storage just means no snapshot.
    }
    return null;
}

export function writeRoadmapSnapshot(userKey: string, roadmap: SavedRoadmap) {
    try {
        localStorage.setItem(snapshotKey, JSON.stringify({ userKey, roadmap }));
    } catch {
        // Storage may be full or disabled.
    }
}

export function clearRoadmapSnapshot() {
    try {
        localStorage.removeItem(snapshotKey);
    } catch {
        // ignore
    }
}

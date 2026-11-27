import { BatchCourseData } from '../types/types';
import { searchAPIResults } from './util';

const cacheKey = 'planner-course-details-v1';
const cacheLifetime = 5 * 60 * 1000;

// Cache public catalog data only. Plan structure and edits still come from the roadmap loader.
const inflight = new Map<string, Promise<BatchCourseData>>();

export function loadPlannerCourses(courseIds: string[]): Promise<BatchCourseData> {
    const key = JSON.stringify([...new Set(courseIds)].sort());
    let pending = inflight.get(key);
    if (!pending) {
        pending = fetchPlannerCourses(courseIds).finally(() => inflight.delete(key));
        inflight.set(key, pending);
    }
    return pending;
}

async function fetchPlannerCourses(courseIds: string[]): Promise<BatchCourseData> {
    const ids = [...new Set(courseIds)].sort();
    if (!ids.length) return {};
    const key = JSON.stringify(ids);

    try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) ?? 'null');
        if (
            cached?.key === key &&
            cached.expiresAt > Date.now() &&
            cached.courses &&
            typeof cached.courses === 'object' &&
            !Array.isArray(cached.courses)
        ) {
            return cached.courses;
        }
    } catch {
        // Corrupt or unavailable storage must not prevent loading the roadmap.
    }

    const courses = await searchAPIResults('courses', ids);
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ key, expiresAt: Date.now() + cacheLifetime, courses }));
    } catch {
        // Storage may be disabled or full; the fresh response is still usable.
    }
    return courses;
}

import { getLocalStorageHiddenCourses, setLocalStorageHiddenCourses } from '$lib/localStorage';
import { ShortCourse, VisibilityState } from '@packages/antalmanac-types';
import { create } from 'zustand';

export type { VisibilityState };
type VisibilityMap = Record<string, Record<string, VisibilityState>>;

const NEXT_VISIBILITY: Record<VisibilityState, VisibilityState> = {
    visible: 'outlined',
    outlined: 'disappeared',
    disappeared: 'visible',
};

interface HiddenCoursesStore {
    visibilityMap: VisibilityMap;
    getVisibility: (scheduleId: string, sectionCode: string) => VisibilityState;
    cycleVisibility: (scheduleId: string, sectionCode: string) => void;
    hydrateFromSchedules: (schedules: Array<{ id?: string; courses: ShortCourse[] }>) => void;
}

function loadFromStorage(): VisibilityMap {
    try {
        const raw = getLocalStorageHiddenCourses();
        if (raw) return JSON.parse(raw) as VisibilityMap;
    } catch {
        // ignore malformed data
    }
    return {};
}

export const useHiddenCoursesStore = create<HiddenCoursesStore>((set, get) => ({
    visibilityMap: loadFromStorage(),

    getVisibility: (scheduleId, sectionCode) => {
        return get().visibilityMap[scheduleId]?.[sectionCode] ?? 'visible';
    },

    cycleVisibility: (scheduleId, sectionCode) => {
        const current = get().visibilityMap;
        const currentState: VisibilityState = current[scheduleId]?.[sectionCode] ?? 'visible';
        const nextState = NEXT_VISIBILITY[currentState];

        const scheduleMap = { ...current[scheduleId] };
        if (nextState === 'visible') {
            delete scheduleMap[sectionCode];
        } else {
            scheduleMap[sectionCode] = nextState;
        }

        const newMap = { ...current };
        if (Object.keys(scheduleMap).length === 0) {
            delete newMap[scheduleId];
        } else {
            newMap[scheduleId] = scheduleMap;
        }

        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ visibilityMap: newMap });
    },

    hydrateFromSchedules: (schedules) => {
        const newMap: VisibilityMap = {};
        for (const schedule of schedules) {
            if (!schedule.id) continue;
            for (const course of schedule.courses) {
                const visibility = course.visibility ?? 'visible';
                if (visibility !== 'visible') {
                    newMap[schedule.id] ??= {};
                    newMap[schedule.id][course.sectionCode] = visibility;
                }
            }
        }
        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ visibilityMap: newMap });
    },
}));

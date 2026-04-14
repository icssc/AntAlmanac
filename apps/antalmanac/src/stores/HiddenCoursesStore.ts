import { create } from 'zustand';

import { getLocalStorageHiddenCourses, setLocalStorageHiddenCourses } from '$lib/localStorage';

export type VisibilityState = 'visible' | 'outlined' | 'disappeared';
type VisibilityMap = Record<string, Record<string, VisibilityState>>;

const NEXT_VISIBILITY: Record<VisibilityState, VisibilityState> = {
    visible: 'outlined',
    outlined: 'disappeared',
    disappeared: 'visible',
};

interface HiddenCoursesStore {
    visibilityMap: VisibilityMap;
    getVisibility: (scheduleIndex: number, sectionCode: string) => VisibilityState;
    cycleVisibility: (scheduleIndex: number, sectionCode: string) => void;
    remapAfterDelete: (deletedIndex: number) => void;
    remapAfterReorder: (from: number, to: number) => void;
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

    getVisibility: (scheduleIndex, sectionCode) => {
        const key = String(scheduleIndex);
        return get().visibilityMap[key]?.[sectionCode] ?? 'visible';
    },

    cycleVisibility: (scheduleIndex, sectionCode) => {
        const key = String(scheduleIndex);
        const current = get().visibilityMap;
        const currentState: VisibilityState = current[key]?.[sectionCode] ?? 'visible';
        const nextState = NEXT_VISIBILITY[currentState];

        const scheduleMap = { ...(current[key] ?? {}) };
        if (nextState === 'visible') {
            delete scheduleMap[sectionCode];
        } else {
            scheduleMap[sectionCode] = nextState;
        }

        const newMap = { ...current };
        if (Object.keys(scheduleMap).length === 0) {
            delete newMap[key];
        } else {
            newMap[key] = scheduleMap;
        }

        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ visibilityMap: newMap });
    },

    remapAfterDelete: (deletedIndex) => {
        const current = get().visibilityMap;
        const newMap: VisibilityMap = {};
        for (const key of Object.keys(current)) {
            const i = Number(key);
            if (i === deletedIndex) continue;
            if (i > deletedIndex) {
                newMap[String(i - 1)] = current[key];
            } else {
                newMap[key] = current[key];
            }
        }
        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ visibilityMap: newMap });
    },

    remapAfterReorder: (from, to) => {
        const current = get().visibilityMap;
        const newMap: VisibilityMap = {};
        const min = Math.min(from, to);
        const max = Math.max(from, to);
        for (const key of Object.keys(current)) {
            const i = Number(key);
            if (i < min || i > max) {
                newMap[key] = current[key];
            } else if (i === from) {
                newMap[String(to)] = current[key];
            } else {
                const shift = from < to ? -1 : 1;
                newMap[String(i + shift)] = current[key];
            }
        }
        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ visibilityMap: newMap });
    },
}));

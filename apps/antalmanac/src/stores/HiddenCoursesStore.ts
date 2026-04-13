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
}));

import { create } from 'zustand';

import { getLocalStorageHiddenCourses, setLocalStorageHiddenCourses } from '$lib/localStorage';

type HiddenCoursesMap = Record<string, string[]>;

interface HiddenCoursesStore {
    hiddenCourses: HiddenCoursesMap;
    isHidden: (scheduleIndex: number, sectionCode: string) => boolean;
    toggleHidden: (scheduleIndex: number, sectionCode: string) => void;
}

function loadFromStorage(): HiddenCoursesMap {
    try {
        const raw = getLocalStorageHiddenCourses();
        if (raw) return JSON.parse(raw) as HiddenCoursesMap;
    } catch {
        // ignore malformed data
    }
    return {};
}

export const useHiddenCoursesStore = create<HiddenCoursesStore>((set, get) => ({
    hiddenCourses: loadFromStorage(),

    isHidden: (scheduleIndex, sectionCode) => {
        const key = String(scheduleIndex);
        return get().hiddenCourses[key]?.includes(sectionCode) ?? false;
    },

    toggleHidden: (scheduleIndex, sectionCode) => {
        const key = String(scheduleIndex);
        const current = get().hiddenCourses;
        const existing = current[key] ?? [];
        const updated = existing.includes(sectionCode)
            ? existing.filter((code) => code !== sectionCode)
            : [...existing, sectionCode];
        const newMap = { ...current, [key]: updated };
        setLocalStorageHiddenCourses(JSON.stringify(newMap));
        set({ hiddenCourses: newMap });
    },
}));

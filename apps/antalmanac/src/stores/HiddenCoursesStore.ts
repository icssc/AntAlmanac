import { courseColorKey } from '$lib/sectionThemes';
import { ShortCourse, VisibilityState, type AATerm } from '@packages/antalmanac-types';
import { create } from 'zustand';

type VisibilityMap = Record<string, Record<string, VisibilityState>>;

const NEXT_VISIBILITY: Record<VisibilityState, VisibilityState> = {
    [VisibilityState.Visible]: VisibilityState.Outlined,
    [VisibilityState.Outlined]: VisibilityState.Disappeared,
    [VisibilityState.Disappeared]: VisibilityState.Visible,
};

interface HiddenCoursesStore {
    visibilityMap: VisibilityMap;
    getVisibility: (scheduleId: string, term: AATerm | string, sectionCode: string) => VisibilityState;
    cycleVisibility: (scheduleId: string, term: AATerm | string, sectionCode: string) => void;
    clearCourseVisibility: (scheduleId: string, term: AATerm | string, sectionCode: string) => void;
    clearScheduleVisibility: (scheduleId: string) => void;
    hydrateFromSchedules: (schedules: Array<{ id?: string; courses: ShortCourse[] }>) => void;
}

function sectionVisibilityKey(term: AATerm | string, sectionCode: string): string {
    return courseColorKey(term, sectionCode);
}

export const useHiddenCoursesStore = create<HiddenCoursesStore>((set, get) => ({
    visibilityMap: {},

    getVisibility: (scheduleId, term, sectionCode) => {
        const key = sectionVisibilityKey(term, sectionCode);
        const scheduleMap = get().visibilityMap[scheduleId];
        if (!scheduleMap) return VisibilityState.Visible;
        if (scheduleMap[key] != null) return scheduleMap[key];
        // Legacy: sectionCode-only keys from before term-scoped visibility.
        return scheduleMap[sectionCode] ?? VisibilityState.Visible;
    },

    cycleVisibility: (scheduleId, term, sectionCode) => {
        const visibilityMap = get().visibilityMap;
        const key = sectionVisibilityKey(term, sectionCode);
        const currentVisibility: VisibilityState = get().getVisibility(scheduleId, term, sectionCode);
        const nextVisibility = NEXT_VISIBILITY[currentVisibility];

        const scheduleMap = { ...visibilityMap[scheduleId] };
        delete scheduleMap[sectionCode];
        if (nextVisibility === VisibilityState.Visible) {
            delete scheduleMap[key];
        } else {
            scheduleMap[key] = nextVisibility;
        }

        const newVisibilityMap = { ...visibilityMap };
        if (Object.keys(scheduleMap).length === 0) {
            delete newVisibilityMap[scheduleId];
        } else {
            newVisibilityMap[scheduleId] = scheduleMap;
        }
        set({ visibilityMap: newVisibilityMap });
    },

    clearCourseVisibility: (scheduleId, term, sectionCode) => {
        const visibilityMap = get().visibilityMap;
        const key = sectionVisibilityKey(term, sectionCode);
        if (!visibilityMap[scheduleId]?.[key] && !visibilityMap[scheduleId]?.[sectionCode]) {
            return;
        }

        const scheduleMap = { ...visibilityMap[scheduleId] };
        delete scheduleMap[key];
        delete scheduleMap[sectionCode];

        const newVisibilityMap = { ...visibilityMap };
        if (Object.keys(scheduleMap).length === 0) {
            delete newVisibilityMap[scheduleId];
        } else {
            newVisibilityMap[scheduleId] = scheduleMap;
        }
        set({ visibilityMap: newVisibilityMap });
    },

    clearScheduleVisibility: (scheduleId) => {
        const current = get().visibilityMap;
        if (!current[scheduleId]) return;

        const newMap = { ...current };
        delete newMap[scheduleId];
        set({ visibilityMap: newMap });
    },

    hydrateFromSchedules: (schedules) => {
        const newMap: VisibilityMap = {};
        for (const schedule of schedules) {
            if (!schedule.id) continue;
            for (const course of schedule.courses) {
                const visibility = course.visibility ?? VisibilityState.Visible;
                if (visibility !== VisibilityState.Visible) {
                    newMap[schedule.id] ??= {};
                    newMap[schedule.id][sectionVisibilityKey(course.term, course.sectionCode)] = visibility;
                }
            }
        }
        set({ visibilityMap: newMap });
    },
}));

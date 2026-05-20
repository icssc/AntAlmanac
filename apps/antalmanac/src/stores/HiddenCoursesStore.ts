import { ShortCourse, VisibilityState } from '@packages/antalmanac-types';
import { create } from 'zustand';

export { VisibilityState };
type VisibilityMap = Record<string, Record<string, VisibilityState>>;

const NEXT_VISIBILITY: Record<VisibilityState, VisibilityState> = {
    [VisibilityState.Visible]: VisibilityState.Outlined,
    [VisibilityState.Outlined]: VisibilityState.Disappeared,
    [VisibilityState.Disappeared]: VisibilityState.Visible,
};

interface HiddenCoursesStore {
    visibilityMap: VisibilityMap;
    getVisibility: (scheduleId: string, sectionCode: string) => VisibilityState;
    cycleVisibility: (scheduleId: string, sectionCode: string) => void;
    clearCourseVisibility: (scheduleId: string, sectionCode: string) => void;
    clearScheduleVisibility: (scheduleId: string) => void;
    hydrateFromSchedules: (schedules: Array<{ id?: string; courses: ShortCourse[] }>) => void;
}

export const useHiddenCoursesStore = create<HiddenCoursesStore>((set, get) => ({
    visibilityMap: {},

    getVisibility: (scheduleId, sectionCode) => {
        return get().visibilityMap[scheduleId]?.[sectionCode] ?? VisibilityState.Visible;
    },

    cycleVisibility: (scheduleId, sectionCode) => {
        const visibilityMap = get().visibilityMap;
        const currentVisibility: VisibilityState = visibilityMap[scheduleId]?.[sectionCode] ?? VisibilityState.Visible;
        const nextVisibility = NEXT_VISIBILITY[currentVisibility];

        const scheduleMap = { ...visibilityMap[scheduleId] };
        if (nextVisibility === VisibilityState.Visible) {
            delete scheduleMap[sectionCode];
        } else {
            scheduleMap[sectionCode] = nextVisibility;
        }

        const newVisibilityMap = { ...visibilityMap };
        if (Object.keys(scheduleMap).length === 0) {
            delete newVisibilityMap[scheduleId];
        } else {
            newVisibilityMap[scheduleId] = scheduleMap;
        }
        console.log('newVisibilityMap', newVisibilityMap);
        set({ visibilityMap: newVisibilityMap });
    },

    clearCourseVisibility: (scheduleId, sectionCode) => {
        const visibilityMap = get().visibilityMap;
        if (visibilityMap[scheduleId]?.[sectionCode]) {
            const scheduleMap = { ...visibilityMap[scheduleId] };
            delete scheduleMap[sectionCode];
            const newVisibilityMap = { ...visibilityMap };
            if (Object.keys(scheduleMap).length === 0) {
                delete newVisibilityMap[scheduleId];
            } else {
                newVisibilityMap[scheduleId] = scheduleMap;
            }
            set({ visibilityMap: newVisibilityMap });
        }
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
                    newMap[schedule.id][course.sectionCode] = visibility;
                }
            }
        }
        set({ visibilityMap: newMap });
    },
}));

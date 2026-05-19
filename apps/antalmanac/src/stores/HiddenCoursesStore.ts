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
    hydrateFromSchedules: (schedules: Array<{ id?: string; courses: ShortCourse[] }>) => void;
}

export const useHiddenCoursesStore = create<HiddenCoursesStore>((set, get) => ({
    visibilityMap: {},

    getVisibility: (scheduleId, sectionCode) => {
        return get().visibilityMap[scheduleId]?.[sectionCode] ?? VisibilityState.Visible;
    },

    cycleVisibility: (scheduleId, sectionCode) => {
        const current = get().visibilityMap;
        const currentState: VisibilityState = current[scheduleId]?.[sectionCode] ?? VisibilityState.Visible;
        const nextState = NEXT_VISIBILITY[currentState];

        const scheduleMap = { ...current[scheduleId] };
        if (nextState === VisibilityState.Visible) {
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

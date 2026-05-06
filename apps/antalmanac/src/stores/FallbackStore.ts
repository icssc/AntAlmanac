import type { ShortCourseSchedule } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface FallbackStore {
    fallbackMode: boolean;
    fallbackSchedules: ShortCourseSchedule[];

    loadFallbackSchedules: (schedules: ShortCourseSchedule[]) => void;
    getCurrentFallbackSchedule: (currentScheduleIndex: number) => ShortCourseSchedule | undefined;
    getFallbackScheduleNames: () => string[];
}

export const useFallbackStore = create<FallbackStore>((set, get) => ({
    fallbackMode: false,
    fallbackSchedules: [],

    loadFallbackSchedules: (schedules: ShortCourseSchedule[]) => {
        set({ fallbackSchedules: schedules, fallbackMode: true });
    },

    getCurrentFallbackSchedule: (currentScheduleIndex: number) => {
        return get().fallbackSchedules[currentScheduleIndex];
    },

    getFallbackScheduleNames: () => {
        return get().fallbackSchedules.map((schedule) => schedule.scheduleName);
    },
}));

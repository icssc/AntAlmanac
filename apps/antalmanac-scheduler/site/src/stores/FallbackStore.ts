import type { ShortCourseSchedule } from '@packages/antalmanac-types';
import { create } from 'zustand';

const EMPTY_FALLBACK_SCHEDULE: ShortCourseSchedule = {
    scheduleName: '',
    courses: [],
    customEvents: [],
    scheduleNote: '',
};

interface FallbackStore {
    fallbackMode: boolean;
    fallbackSchedules: ShortCourseSchedule[];

    loadFallbackSchedules: (schedules: ShortCourseSchedule[]) => void;
    getCurrentFallbackSchedule: (currentScheduleIndex: number) => ShortCourseSchedule;
    getFallbackScheduleNames: () => string[];
}

export const useFallbackStore = create<FallbackStore>((set, get) => ({
    fallbackMode: false,
    fallbackSchedules: [],

    loadFallbackSchedules: (schedules: ShortCourseSchedule[]) => {
        set({ fallbackSchedules: schedules, fallbackMode: true });
    },

    getCurrentFallbackSchedule: (currentScheduleIndex: number) => {
        return get().fallbackSchedules.at(currentScheduleIndex) ?? EMPTY_FALLBACK_SCHEDULE;
    },

    getFallbackScheduleNames: () => {
        return get().fallbackSchedules.map((schedule) => schedule.scheduleName);
    },
}));

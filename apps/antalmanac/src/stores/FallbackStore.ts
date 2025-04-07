import type { ShortCourseSchedule } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface FallbackStore {
    fallback: boolean;
    fallbackSchedules: ShortCourseSchedule[];
    setFallback: (value: boolean) => void;
}

export const useFallbackStore = create<FallbackStore>((set) => {
    return {
        fallback: false,
        fallbackSchedules: [],
        setFallback: (value: boolean) => {
            set(() => ({
                fallback: value,
            }));
        },
    };
});

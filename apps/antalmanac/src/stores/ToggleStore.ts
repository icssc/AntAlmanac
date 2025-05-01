import { create } from 'zustand';

interface ToggleState {
    openScheduleSelect: boolean;
    loadingSchedule: boolean;
    setOpenScheduleSelect: (open: boolean) => void;
    setOpenLoadingSchedule: (open: boolean) => void;
    toggleScheduleSelect: () => void;
}

export const useToggleStore = create<ToggleState>((set) => ({
    openScheduleSelect: false,
    loadingSchedule: false,
    setOpenScheduleSelect: (open) => set({ openScheduleSelect: open }),
    setOpenLoadingSchedule: (open) => set({ loadingSchedule: open }),
    toggleScheduleSelect: () => set((state) => ({ openScheduleSelect: !state.openScheduleSelect })),
}));

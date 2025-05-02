import { create } from 'zustand';

interface ToggleState {
    openScheduleSelect: boolean;
    openLoadingSchedule: boolean;
    openImportDialog: boolean;
    setOpenScheduleSelect: (open: boolean) => void;
    setOpenLoadingSchedule: (open: boolean) => void;
    setOpenImportDialog: (open: boolean) => void;
}

export const useToggleStore = create<ToggleState>((set) => ({
    openScheduleSelect: false,
    openLoadingSchedule: false,
    openImportDialog: false,
    setOpenScheduleSelect: (open) => set({ openScheduleSelect: open }),
    setOpenLoadingSchedule: (open) => set({ openLoadingSchedule: open }),
    setOpenImportDialog: (open) => set({ openImportDialog: open }),
}));

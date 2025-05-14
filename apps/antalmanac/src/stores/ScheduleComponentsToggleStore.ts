import { create } from 'zustand';

interface scheduleComponentsToggleState {
    openScheduleSelect: boolean;
    openLoadingSchedule: boolean;
    openImportDialog: boolean;
    openAutoSaveWarning: boolean;
    setOpenScheduleSelect: (open: boolean) => void;
    setOpenLoadingSchedule: (open: boolean) => void;
    setOpenImportDialog: (open: boolean) => void;
    setOpenAutoSaveWarning: (open: boolean) => void;
}

export const scheduleComponentsToggleStore = create<scheduleComponentsToggleState>((set) => ({
    openScheduleSelect: false,
    openLoadingSchedule: false,
    openImportDialog: false,
    openAutoSaveWarning: false,
    setOpenScheduleSelect: (open) => set({ openScheduleSelect: open }),
    setOpenLoadingSchedule: (open) => set({ openLoadingSchedule: open }),
    setOpenImportDialog: (open) => set({ openImportDialog: open }),
    setOpenAutoSaveWarning: (open) => set({ openAutoSaveWarning: open }),
}));

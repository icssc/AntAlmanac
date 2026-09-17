// NB: This store composes the state of dialogs, popovers, etc related to loading, importing, and managing schedules. This is most valuable for managing our auth and migration flows.
import { create } from 'zustand';

interface ScheduleComponentsToggleState {
    openLoadingSchedule: boolean;
    openImportDialog: boolean;
    openAutoSaveWarning: boolean;
    setOpenLoadingSchedule: (open: boolean) => void;
    setOpenImportDialog: (open: boolean) => void;
    setOpenAutoSaveWarning: (open: boolean) => void;
}

export const useScheduleComponentsToggleStore = create<ScheduleComponentsToggleState>((set) => ({
    openLoadingSchedule: true,
    openImportDialog: false,
    openAutoSaveWarning: false,
    setOpenLoadingSchedule: (open) => set({ openLoadingSchedule: open }),
    setOpenImportDialog: (open) => set({ openImportDialog: open }),
    setOpenAutoSaveWarning: (open) => set({ openAutoSaveWarning: open }),
}));

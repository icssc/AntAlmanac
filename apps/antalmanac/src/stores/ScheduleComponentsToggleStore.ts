// NB: This store composes the state of dialogs, popovers, etc related to loading, importing, and managing schedules. This is most valuable for managing our auth and migration flows.
import type { ScheduleViewScope } from '$lib/schedule/ScheduleViewSource';
import { create } from 'zustand';

interface ScheduleComponentsToggleState {
    openScheduleSelect: boolean;
    openScheduleSelectScope: ScheduleViewScope | null;
    openLoadingSchedule: boolean;
    openImportDialog: boolean;
    openAutoSaveWarning: boolean;
    setOpenScheduleSelect: (open: boolean, scope?: ScheduleViewScope | null) => void;
    setOpenLoadingSchedule: (open: boolean) => void;
    setOpenImportDialog: (open: boolean) => void;
    setOpenAutoSaveWarning: (open: boolean) => void;
}

export const useScheduleComponentsToggleStore = create<ScheduleComponentsToggleState>((set) => ({
    openScheduleSelect: false,
    openScheduleSelectScope: null,
    openLoadingSchedule: true,
    openImportDialog: false,
    openAutoSaveWarning: false,
    setOpenScheduleSelect: (open, scope = null) =>
        set({
            openScheduleSelect: open,
            openScheduleSelectScope: open ? scope : null,
        }),
    setOpenLoadingSchedule: (open) => set({ openLoadingSchedule: open }),
    setOpenImportDialog: (open) => set({ openImportDialog: open }),
    setOpenAutoSaveWarning: (open) => set({ openAutoSaveWarning: open }),
}));

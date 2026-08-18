import { create } from 'zustand';

interface ScheduleManagementStore {
    scheduleManagementWidth: number | null;
    setScheduleManagementWidth: (width: number) => void;
}

export const useScheduleManagementStore = create<ScheduleManagementStore>((set) => ({
    scheduleManagementWidth: null,
    setScheduleManagementWidth: (width) => set({ scheduleManagementWidth: width }),
}));

import { create } from 'zustand';

interface ToggleState {
    openScheduleSelect: boolean;
    setOpenScheduleSelect: (open: boolean) => void;
    toggleScheduleSelect: () => void;
}

export const useToggleStore = create<ToggleState>((set) => ({
    openScheduleSelect: false,
    setOpenScheduleSelect: (open) => set({ openScheduleSelect: open }),
    toggleScheduleSelect: () => set((state) => ({ openScheduleSelect: !state.openScheduleSelect })),
}));

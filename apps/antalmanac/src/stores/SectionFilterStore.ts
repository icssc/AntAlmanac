import { create } from 'zustand';

export const SORT_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'status', label: 'Status' },
    { value: 'time_asc', label: 'Time' },
    { value: 'days_mwf', label: 'Date: MWF' },
    { value: 'days_tuth', label: 'Date: TuTh' },
    { value: 'gpa_descending', label: 'GPA' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

interface SectionFilterStore {
    sortBy: SortOption;
    setSortBy: (option: SortOption) => void;
}

export const useSectionFilterStore = create<SectionFilterStore>((set) => ({
    sortBy: 'default',
    setSortBy: (sortBy) => set({ sortBy }),
}));

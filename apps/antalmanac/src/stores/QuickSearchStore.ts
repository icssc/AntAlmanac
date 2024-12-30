import { create } from 'zustand';

type CourseInfo = {
    term: string; // e.g., "Fall 2024", "Spring 2025"
    deptLabel: string; // e.g., "COMPSCI", "MATH"
    courseNumber: string; // e.g., "171", "101"
    deptValue: string; // e.g., "171", "101"
};

interface QuickSearchStore {
    value: CourseInfo;
    setValue: (newValue: CourseInfo) => void;
}

export const useQuickSearchStore = create<QuickSearchStore>((set) => ({
    value: { term: '', deptLabel: '', courseNumber: '', deptValue: '' },
    setValue: (newValue: CourseInfo) => {
        set(() => ({
            value: newValue,
        }));
    },
}));

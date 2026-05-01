import { create } from 'zustand';

export interface EnrollmentAnchor {
    courseId: string;
    year: string;
    quarter: string;
    primaryInstructor: string | undefined;
}

export interface EnrollmentAnchorStore {
    anchor: EnrollmentAnchor | undefined;
    setAnchor: (anchor: EnrollmentAnchor | undefined) => void;
}

export const useEnrollmentAnchorStore = create<EnrollmentAnchorStore>((set) => ({
    anchor: undefined,
    setAnchor: (anchor) => set({ anchor }),
}));

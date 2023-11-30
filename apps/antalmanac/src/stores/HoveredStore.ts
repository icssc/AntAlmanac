import { ScheduleCourse } from '@packages/antalmanac-types';
import { create } from 'zustand';
import { CourseDetails } from '$lib/course_data.types';

export interface HoveredStore {
    hoveredCourse: ScheduleCourse | undefined;
    setHoveredCourse: (section: any, courseDetails: CourseDetails, term: string, scheduleIndex: number) => void;
}

export const useHoveredStore = create<HoveredStore>((set) => {
    const hoveredSectionCode = undefined;

    return {
        hoveredCourse: hoveredSectionCode,
        setHoveredCourse: (hoveredCourse) => {
            set({ hoveredCourse });
        },
    };
});

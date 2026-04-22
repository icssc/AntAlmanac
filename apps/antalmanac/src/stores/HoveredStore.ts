import { AASection, ScheduleCourse, CourseDetails } from '@packages/antalmanac-types';
import { create } from 'zustand';

import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { calendarizeCourseEvents, calendarizeFinals } from '$stores/calendarizeHelpers';

const HOVERED_SECTION_COLOR = '#80808080';
export interface HoveredStore {
    hoveredEvent: ScheduleCourse | undefined;
    setHoveredEvent: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
    hoveredCalendarizedCourses: CourseEvent[] | undefined;
    hoveredCalendarizedFinal: CourseEvent | undefined;
}

const DEFAULT_HOVERED_STORE = {
    hoveredEvent: undefined,
    hoveredCalendarizedCourses: undefined,
    hoveredCalendarizedFinal: undefined,
};

export const useHoveredStore = create<HoveredStore>((set) => {
    return {
        ...DEFAULT_HOVERED_STORE,
        setHoveredEvent: (section, courseDetails, term) => {
            if (section == null || courseDetails == null || term == null) {
                set({ ...DEFAULT_HOVERED_STORE });
                return;
            }

            const event = {
                ...courseDetails,
                section: {
                    ...section,
                    color: HOVERED_SECTION_COLOR,
                },
                term,
            };

            set({
                hoveredEvent: event,
                hoveredCalendarizedCourses: calendarizeCourseEvents([event]),
                hoveredCalendarizedFinal: calendarizeFinals([event])[0],
            });
        },
    };
});

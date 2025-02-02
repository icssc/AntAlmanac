import { AASection, ScheduleCourse, CourseDetails } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { calendarizeCourseEvents, calendarizeFinals } from './calendarizeHelpers';

import { CourseEventProps } from '$components/Calendar/CalendarEventPopoverContent';

const HOVERED_SECTION_COLOR = '#80808080';
export interface HoveredStore {
    hoveredEvent: ScheduleCourse | undefined;
    setHoveredEvent: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
    hoveredCalendarizedCourses: CourseEventProps[] | undefined;
    hoveredCalendarizedFinal: CourseEventProps | undefined;
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

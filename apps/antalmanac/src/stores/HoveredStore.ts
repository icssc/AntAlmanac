import { AASection, ScheduleCourse } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { calendarizeCourseEvents, calendarizeFinals } from './calendarizeHelpers';

import { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { CourseDetails } from '$lib/course_data.types';

const HOVERED_SECTION_COLOR = '#80808080';
export interface HoveredStore {
    hoveredEvents: ScheduleCourse[] | undefined;
    setHoveredEvents: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
    hoveredCalendarizedCourses: CourseEvent[] | undefined;
    hoveredCalendarizedFinal: CourseEvent | undefined;
}

const DEFAULT_HOVERED_STORE = {
    hoveredEvents: undefined,
    hoveredCalendarizedCourses: undefined,
    hoveredCalendarizedFinal: undefined,
};

export const useHoveredStore = create<HoveredStore>((set) => {
    return {
        ...DEFAULT_HOVERED_STORE,
        setHoveredEvents: (section, courseDetails, term) => {
            if (section == null || courseDetails == null || term == null) {
                set({ ...DEFAULT_HOVERED_STORE });
                return;
            }
            set({
                hoveredEvents: [
                    {
                        ...courseDetails,
                        section: {
                            ...section,
                            color: HOVERED_SECTION_COLOR,
                        },
                        term,
                    },
                ],
                hoveredCalendarizedCourses: calendarizeCourseEvents([
                    {
                        ...courseDetails,
                        section: {
                            ...section,
                            color: HOVERED_SECTION_COLOR,
                        },
                        term,
                    },
                ]),
                hoveredCalendarizedFinal: calendarizeFinals([
                    {
                        ...courseDetails,
                        section: {
                            ...section,
                            color: HOVERED_SECTION_COLOR,
                        },
                        term,
                    },
                ])[0],
            });
        },
    };
});

import { create } from 'zustand';
import { AASection } from '@packages/antalmanac-types';
import { calendarizeCourseEvents } from './calendarizeHelpers';
import { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { CourseDetails } from '$lib/course_data.types';

export interface HoveredStore {
    hoveredCourseEvents: CourseEvent[] | undefined;
    setHoveredCourseEvents: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
}

export const useHoveredStore = create<HoveredStore>((set) => {
    return {
        hoveredCourseEvents: undefined,
        setHoveredCourseEvents: (section, courseDetails, term) => {
            set({
                hoveredCourseEvents:
                    section && courseDetails && term
                        ? calendarizeCourseEvents([
                              {
                                  ...courseDetails,
                                  section: {
                                      ...section,
                                      color: '#80808080',
                                  },
                                  term,
                              },
                          ])
                        : undefined,
            });
        },
    };
});

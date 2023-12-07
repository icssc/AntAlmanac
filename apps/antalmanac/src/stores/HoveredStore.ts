import { create } from 'zustand';
import { AASection } from '@packages/antalmanac-types';
import { calendarizeCourseEvents } from './calendarizeHelpers';
import { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { CourseDetails } from '$lib/course_data.types';

export interface HoveredStore {
    hoveredCourse: CourseEvent | undefined;
    setHoveredCourse: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
}

export const useHoveredStore = create<HoveredStore>((set) => {
    return {
        hoveredCourse: undefined,
        setHoveredCourse: (section, courseDetails, term) => {
            set({
                hoveredCourse:
                    section && courseDetails && term
                        ? calendarizeCourseEvents([
                              {
                                  ...courseDetails,
                                  section: {
                                      ...section,
                                      color: '#0000FF',
                                  },
                                  term,
                              },
                          ])[0]
                        : undefined,
            });
        },
    };
});

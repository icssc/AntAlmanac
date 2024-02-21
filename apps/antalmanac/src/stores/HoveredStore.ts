import { create } from 'zustand';
import { AASection, ScheduleCourse } from '@packages/antalmanac-types';
import { calendarizeCourseEvents, calendarizeFinals } from './calendarizeHelpers';
import { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { CourseDetails } from '$lib/course_data.types';

export interface HoveredStore {
    hoveredEvents: ScheduleCourse[] | undefined;
    setHoveredEvents: (section?: AASection, courseDetails?: CourseDetails, term?: string) => void;
    hoveredCalendarizedCourses: CourseEvent[] | undefined;
    hoveredCalendarizedFinal: CourseEvent | undefined;
}

export const useHoveredStore = create<HoveredStore>((set) => {
    return {
        hoveredEvents: undefined,
        hoveredCalendarizedCourses: undefined,
        hoveredCalendarizedFinal: undefined,
        setHoveredEvents: (section, courseDetails, term) => {
            set({
                hoveredEvents:
                    section && courseDetails && term
                        ? [
                              {
                                  ...courseDetails,
                                  section: {
                                      ...section,
                                      color: '#80808080',
                                  },
                                  term,
                              },
                          ]
                        : undefined,
                hoveredCalendarizedCourses:
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
                hoveredCalendarizedFinal:
                    section && courseDetails && term
                        ? calendarizeFinals([
                              {
                                  ...courseDetails,
                                  section: {
                                      ...section,
                                      color: '#80808080',
                                  },
                                  term,
                              },
                          ])[0]
                        : undefined,
            });
        },
    };
});

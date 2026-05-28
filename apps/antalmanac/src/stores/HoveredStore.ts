import type { CourseEvent } from '$components/Calendar/types';
import { calendarizeCourseEvents, calendarizeFinals } from '$stores/calendarizeHelpers';
import { AACourse, AASection, AATerm, ScheduleCourse } from '@packages/antalmanac-types';
import { create } from 'zustand';

const HOVERED_SECTION_COLOR = '#80808080';
interface HoveredStore {
    hoveredEvent: AACourseWithTerm | undefined;
    setHoveredEvent: (section?: AASection, course?: AACourseWithTerm) => void;
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
        setHoveredEvent: (section, course) => {
            if (section == null || course == null) {
                set({ ...DEFAULT_HOVERED_STORE });
                return;
            }

            const event: AACourseWithTerm = {
                ...course,
                sections: [
                    {
                        ...section,
                        color: HOVERED_SECTION_COLOR,
                    },
                ],
            };

            set({
                hoveredEvent: event,
                hoveredCalendarizedCourses: calendarizeCourseEvents([event]),
                hoveredCalendarizedFinal: calendarizeFinals([event])[0],
            });
        },
    };
});

/**
 * helpers to convert courses or events to calendar events
 *
 * "satisfies" is used to ensure that the internal CalendarEvent types
 * we define are compatible with the types that FullCalendar expects,
 * but without unsafe type assertions or coerced generalizing of the type itself
 * @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator}
 */

import type { Event } from 'react-big-calendar';

import type { Course, RepeatingCustomEvent } from '.';

/**
 * common properties for the internal calendar types
 */
interface CommonCalendarEvent {
    color: string;
    start: Date;
    end: Date;
    title: string;
}

/**
 * react-big-calendar compatible calendar event for a course
 */
export interface CourseCalendarEvent extends CommonCalendarEvent {
    bldg: string;
    finalExam: string;
    instructors: string[];
    isCustomEvent: false;
    sectionCode: string;
    sectionType: string;
    term: string;
}

/**
 * react-big-calendar compatible interface derived for a custom event
 */
export interface CustomCalendarEvent extends CommonCalendarEvent {
    color: string;
    start: Date;
    end: Date;
    title: string;
    customEventID: number;
    isCustomEvent: true;
}

export type CalendarEvent = CourseCalendarEvent | CustomCalendarEvent;

/**
 * type guard that asserts the returned value isn't null or undefined
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-guards}
 */
function notNull<T>(x: T): x is NonNullable<T> {
    return x != null;
}

/**
 * converts courses to calendar events
 */
export function getCourseCalendarEvents(courses: Course[] = []): CourseCalendarEvent[] {
    const calendarEventsForAllCourses = courses.map((course) => {
        const calendarEventsForCourse = course.section.meetings
            .map((meeting) => ({ ...meeting, time: meeting.time.replace(/\s/g, '') }))
            .filter((meeting) => meeting.time !== 'TBA')
            .map((meeting) => {
                const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = meeting.time.match(
                    /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
                ) as RegExpMatchArray;

                let startHr = parseInt(startHrStr, 10);
                const startMin = parseInt(startMinStr, 10);
                let endHr = parseInt(endHrStr, 10);
                const endMin = parseInt(endMinStr, 10);

                if (ampm === 'p' && endHr !== 12) {
                    startHr += 12;
                    endHr += 12;
                    if (startHr > endHr) startHr -= 12;
                }

                const calendarEventsMeeting = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'].map((day, index) => {
                    if (meeting.days.includes(day)) {
                        const newCalendarEvent = {
                            color: course.section.color,
                            term: course.term,
                            title: `${course.deptCode} ${course.courseNumber}`,
                            courseTitle: course.courseTitle,
                            bldg: meeting.bldg,
                            instructors: course.section.instructors,
                            sectionCode: course.section.sectionCode,
                            sectionType: course.section.sectionType,
                            start: new Date(2018, 0, index, startHr, startMin),
                            finalExam: course.section.finalExam,
                            end: new Date(2018, 0, index, endHr, endMin),
                            isCustomEvent: false as const,
                        };
                        return newCalendarEvent;
                    }
                });

                const definedCalendarEventsMeetings = calendarEventsMeeting.filter(notNull);
                return definedCalendarEventsMeetings;
            });

        const flatCalendarEventsForCourse = calendarEventsForCourse.flat();
        return flatCalendarEventsForCourse;
    });

    const flatCalendarEventsForAllCourses = calendarEventsForAllCourses.flat();
    return flatCalendarEventsForAllCourses satisfies Event[];
}

/**
 * converts course finals to calendar events
 */
export function getFinalsCalendarEvents(courses: Course[] = []): CourseCalendarEvent[] {
    const finalsForAllCourses = courses
        .filter((course) => course.section.finalExam.length > 5)
        .map((course) => {
            const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = course.section.finalExam.match(
                /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
            ) as RegExpMatchArray;

            let startHour = parseInt(startStr, 10);
            const startMin = parseInt(startMinStr, 10);
            let endHour = parseInt(endStr, 10);
            const endMin = parseInt(endMinStr, 10);

            if (ampm === 'pm' && endHour !== 12) {
                startHour += 12;
                endHour += 12;
                if (startHour > endHour) startHour -= 12;
            }

            const finalsForCourse = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                if (date.includes(day)) {
                    const newCalendarEvent = {
                        title: `${course.deptCode} ${course.courseNumber}`,
                        sectionCode: course.section.sectionCode,
                        sectionType: 'Fin',
                        bldg: course.section.meetings[0].bldg,
                        color: course.section.color,
                        start: new Date(2018, 0, index - 1, startHour, startMin),
                        end: new Date(2018, 0, index - 1, endHour, endMin),
                        finalExam: course.section.finalExam,
                        instructors: course.section.instructors,
                        term: course.term,
                        isCustomEvent: false as const,
                        customEventID: 0,
                    };
                    return newCalendarEvent;
                }
            });

            const definedFinalsForCourse = finalsForCourse.filter(notNull);
            return definedFinalsForCourse;
        });

    const flatFinalsForAllCourses = finalsForAllCourses.flat();
    return flatFinalsForAllCourses satisfies Event[];
}

/**
 * converts custom events to calendar events
 */
export function getCustomCalendarEvents(customEvents: RepeatingCustomEvent[] = []): CustomCalendarEvent[] {
    const allCustomCalendarEvents = customEvents.map((customEvent) => {
        const calendarEventsSingleCustom = customEvent.days.map((day, dayIndex) => {
            if (day) {
                const startHour = parseInt(customEvent.start.slice(0, 2), 10);
                const startMin = parseInt(customEvent.start.slice(3, 5), 10);
                const endHour = parseInt(customEvent.end.slice(0, 2), 10);
                const endMin = parseInt(customEvent.end.slice(3, 5), 10);

                const newCalendarEvent = {
                    customEventID: customEvent.customEventID,
                    color: customEvent.color || '',
                    start: new Date(2018, 0, dayIndex, startHour, startMin),
                    isCustomEvent: true as const,
                    end: new Date(2018, 0, dayIndex, endHour, endMin),
                    title: customEvent.title,
                };
                return newCalendarEvent;
            }
        });

        const definedCalendarEventsSingleCustom = calendarEventsSingleCustom.filter(notNull);
        return definedCalendarEventsSingleCustom;
    });

    const flatCustomCalendarEvents = allCustomCalendarEvents.flat();
    return flatCustomCalendarEvents satisfies Event[];
}

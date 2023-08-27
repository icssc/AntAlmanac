import { describe, test, expect } from 'vitest';
import type { ScheduleCourse } from '@packages/antalmanac-types';
import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import type { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from '$stores/calendarizeHelpers';

describe('calendarize-helpers', () => {
    const courses: ScheduleCourse[] = [
        {
            courseComment: 'string',
            courseNumber: 'string',
            courseTitle: 'string',
            deptCode: 'string',
            prerequisiteLink: 'string',
            section: {
                color: 'string',
                sectionCode: 'string',
                sectionType: 'string',
                sectionNum: 'string',
                units: 'string',
                instructors: [],
                meetings: [
                    {
                        timeIsTBA: false,
                        bldg: [],
                        days: 'MWF',
                        startTime: {
                            hour: 1,
                            minute: 2,
                        },
                        endTime: {
                            hour: 3,
                            minute: 4,
                        },
                    },
                ],
                finalExam: {
                    examStatus: 'SCHEDULED_FINAL',
                    dayOfWeek: 'Sun',
                    month: 2,
                    day: 3,
                    startTime: {
                        hour: 1,
                        minute: 2,
                    },
                    endTime: {
                        hour: 3,
                        minute: 4,
                    },
                    bldg: [],
                },
                maxCapacity: 'string',
                numCurrentlyEnrolled: {
                    totalEnrolled: 'string',
                    sectionEnrolled: 'string',
                },
                numOnWaitlist: 'string',
                numWaitlistCap: 'string',
                numRequested: 'string',
                numNewOnlyReserved: 'string',
                restrictions: 'string',
                status: 'OPEN',
                sectionComment: 'string',
            },
            term: 'string',
        },
    ];

    const customEvents: RepeatingCustomEvent[] = [
        {
            title: 'title',
            start: '01:02',
            end: '03:04',
            days: [true, false, true, false, true, false, true],
            customEventID: 0,
            color: '#000000',
        },
    ];

    test('calendarizeCourseEvents', () => {
        const newResult = calendarizeCourseEvents(courses);
        const oldResult = oldCalendarizeCourseEvents(courses);
        expect(newResult).toStrictEqual(oldResult);
    });

    test('calendarizeFinals', () => {
        const newResult = calendarizeFinals(courses);
        const oldResult = oldCalendarizeFinals(courses);
        expect(newResult).toStrictEqual(oldResult);
    });

    test('calendarizeCustomEvents', () => {
        const newResult = calendarizeCustomEvents(customEvents);
        const oldResult = oldClendarizeCustomEvents(customEvents);
        expect(newResult).toStrictEqual(oldResult);
    });
});

/**
 * TODO: Remove this and replace with an array of expected values.
 */
export function oldCalendarizeCourseEvents(currentCourses: ScheduleCourse[] = []): CourseEvent[] {
    const courseEventsInCalendar: CourseEvent[] = [];

    for (const course of currentCourses) {
        for (const meeting of course.section.meetings) {
            if (!meeting.timeIsTBA && meeting.startTime && meeting.endTime && meeting.days) {
                const startHour = meeting.startTime.hour;
                const startMin = meeting.startTime.minute;
                const endHour = meeting.endTime.hour;
                const endMin = meeting.endTime.minute;

                const dates: boolean[] = [
                    meeting.days.includes('Su'),
                    meeting.days.includes('M'),
                    meeting.days.includes('Tu'),
                    meeting.days.includes('W'),
                    meeting.days.includes('Th'),
                    meeting.days.includes('F'),
                    meeting.days.includes('Sa'),
                ];

                dates.forEach((shouldBeInCal, index) => {
                    if (shouldBeInCal) {
                        courseEventsInCalendar.push({
                            color: course.section.color,
                            term: course.term,
                            title: course.deptCode + ' ' + course.courseNumber,
                            courseTitle: course.courseTitle,
                            bldg: meeting.bldg[0],
                            instructors: course.section.instructors,
                            sectionCode: course.section.sectionCode,
                            sectionType: course.section.sectionType,
                            start: new Date(2018, 0, index, startHour, startMin),
                            end: new Date(2018, 0, index, endHour, endMin),
                            finalExam: course.section.finalExam,
                            isCustomEvent: false as const,
                        });
                    }
                });
            }
        }
    }

    return courseEventsInCalendar;
}

/**
 * TODO: Remove this and replace with an array of expected values.
 */
export function oldCalendarizeFinals(currentCourses: ScheduleCourse[] = []): CourseEvent[] {
    const finalsEventsInCalendar: CourseEvent[] = [];

    for (const course of currentCourses) {
        const finalExam = course.section.finalExam;

        if (
            finalExam.examStatus == 'SCHEDULED_FINAL' &&
            finalExam.startTime &&
            finalExam.endTime &&
            finalExam.dayOfWeek
        ) {
            // TODO: this block is almost the same as in calenarizeCourseEvents. we should refactor to remove the duplicate code.

            const startHour = finalExam.startTime.hour;
            const startMin = finalExam.startTime.minute;
            const endHour = finalExam.endTime.hour;
            const endMin = finalExam.endTime.minute;

            const weekdayInclusion: boolean[] = [
                finalExam.dayOfWeek.includes('Sat'),
                finalExam.dayOfWeek.includes('Sun'),
                finalExam.dayOfWeek.includes('Mon'),
                finalExam.dayOfWeek.includes('Tue'),
                finalExam.dayOfWeek.includes('Wed'),
                finalExam.dayOfWeek.includes('Thu'),
                finalExam.dayOfWeek.includes('Fri'),
            ];

            weekdayInclusion.forEach((shouldBeInCal, index) => {
                if (shouldBeInCal)
                    finalsEventsInCalendar.push({
                        color: course.section.color,
                        term: course.term,
                        title: course.deptCode + ' ' + course.courseNumber,
                        courseTitle: course.courseTitle,
                        bldg: course.section.meetings[0].bldg[0],
                        instructors: course.section.instructors,
                        sectionCode: course.section.sectionCode,
                        sectionType: 'Fin',
                        start: new Date(2018, 0, index - 1, startHour, startMin),
                        end: new Date(2018, 0, index - 1, endHour, endMin),
                        finalExam: course.section.finalExam,
                        isCustomEvent: false,
                    });
            });
        }
    }

    return finalsEventsInCalendar;
}

/**
 * TODO: Remove this and replace with an array of expected values.
 */
export function oldClendarizeCustomEvents(currentCustomEvents: RepeatingCustomEvent[] = []): CustomEvent[] {
    const customEventsInCalendar: CustomEvent[] = [];
    for (const customEvent of currentCustomEvents) {
        for (let dayIndex = 0; dayIndex < customEvent.days.length; dayIndex++) {
            if (customEvent.days[dayIndex]) {
                const startHour = parseInt(customEvent.start.slice(0, 2), 10);
                const startMin = parseInt(customEvent.start.slice(3, 5), 10);
                const endHour = parseInt(customEvent.end.slice(0, 2), 10);
                const endMin = parseInt(customEvent.end.slice(3, 5), 10);
                customEventsInCalendar.push({
                    customEventID: customEvent.customEventID,
                    color: customEvent.color ?? '#000000',
                    start: new Date(2018, 0, dayIndex, startHour, startMin),
                    isCustomEvent: true,
                    end: new Date(2018, 0, dayIndex, endHour, endMin),
                    title: customEvent.title,
                });
            }
        }
    }
    return customEventsInCalendar;
}

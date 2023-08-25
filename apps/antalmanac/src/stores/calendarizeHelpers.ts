import { ScheduleCourse } from '@packages/antalmanac-types';
import { HourMinute } from 'peterportal-api-next-types';
import { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { notNull, getReferencesOccurring } from '$lib/utils';

const COURSE_WEEK_DAYS = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

const FINALS_WEEK_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function calendarizeCourseEvents(currentCourses: ScheduleCourse[] = []): CourseEvent[] {
    return currentCourses.flatMap((course) => {
        return course.section.meetings
            .filter((meeting) => !meeting.timeIsTBA && meeting.startTime && meeting.endTime && meeting.days)
            .flatMap((meeting) => {
                const startHour = meeting.startTime?.hour;
                const startMin = meeting.startTime?.minute;
                const endHour = meeting.endTime?.hour;
                const endMin = meeting.endTime?.minute;

                /**
                 * An array of booleans indicating whether a course meeting occurs on that day.
                 *
                 * @example [false, true, false, true, false, true, false], i.e. [M, W, F]
                 */
                const daysOccurring = getReferencesOccurring(COURSE_WEEK_DAYS, meeting.days);

                /**
                 * Only include the day indices that the meeting occurs.
                 *
                 * @example [false, true, false, true, false, true, false] -> [1, 3, 5]
                 */
                const dayIndicesOccurring = daysOccurring
                    .map((day, index) => (day ? index : undefined))
                    .filter(notNull);

                return dayIndicesOccurring.map((dayIndex) => {
                    return {
                        color: course.section.color,
                        term: course.term,
                        title: `${course.deptCode} ${course.courseNumber}`,
                        courseTitle: course.courseTitle,
                        bldg: meeting.bldg[0],
                        instructors: course.section.instructors,
                        sectionCode: course.section.sectionCode,
                        sectionType: course.section.sectionType,
                        start: new Date(2018, 0, dayIndex, startHour, startMin),
                        end: new Date(2018, 0, dayIndex, endHour, endMin),
                        finalExam: course.section.finalExam,
                        isCustomEvent: false,
                    };
                });
            });
    });
}

export function calendarizeFinals(currentCourses: ScheduleCourse[] = []): CourseEvent[] {
    return currentCourses
        .filter(
            (course) =>
                course.section.finalExam.examStatus === 'SCHEDULED_FINAL' &&
                course.section.finalExam.startTime &&
                course.section.finalExam.endTime &&
                course.section.finalExam.dayOfWeek
        )
        .flatMap((course) => {
            const finalExam = course.section.finalExam;
            const startHour = finalExam.startTime?.hour;
            const startMin = finalExam.startTime?.minute;
            const endHour = finalExam.endTime?.hour;
            const endMin = finalExam.endTime?.minute;

            /**
             * An array of booleans indicating whether the day at that index is a day that the final.
             *
             * @example [false, false, false, true, false, true, false], i.e. [T, Th]
             */
            const weekdaysOccurring = getReferencesOccurring(FINALS_WEEK_DAYS, course.section.finalExam.dayOfWeek);

            /**
             * Only include the day indices that the final is occurring.
             *
             * @example [false, false, false, true, false, true, false] -> [3, 5]
             */
            const dayIndicesOcurring = weekdaysOccurring.map((day, index) => (day ? index : undefined)).filter(notNull);

            return dayIndicesOcurring.map((dayIndex) => {
                return {
                    color: course.section.color,
                    term: course.term,
                    title: `${course.deptCode} ${course.courseNumber}`,
                    courseTitle: course.courseTitle,
                    bldg: course.section.meetings[0].bldg[0],
                    instructors: course.section.instructors,
                    sectionCode: course.section.sectionCode,
                    sectionType: 'Fin',
                    start: new Date(2018, 0, dayIndex - 1, startHour, startMin),
                    end: new Date(2018, 0, dayIndex - 1, endHour, endMin),
                    finalExam: course.section.finalExam,
                    isCustomEvent: false,
                };
            });
        });
}

export function calendarizeCustomEvents(currentCustomEvents: RepeatingCustomEvent[] = []): CustomEvent[] {
    return currentCustomEvents.flatMap((customEvent) => {
        const dayIndiciesOcurring = customEvent.days.map((day, index) => (day ? index : undefined)).filter(notNull);

        return dayIndiciesOcurring.map((dayIndex) => {
            const startHour = parseInt(customEvent.start.slice(0, 2), 10);
            const startMin = parseInt(customEvent.start.slice(3, 5), 10);
            const endHour = parseInt(customEvent.end.slice(0, 2), 10);
            const endMin = parseInt(customEvent.end.slice(3, 5), 10);

            return {
                customEventID: customEvent.customEventID,
                color: customEvent.color ?? '#000000',
                start: new Date(2018, 0, dayIndex, startHour, startMin),
                isCustomEvent: true,
                end: new Date(2018, 0, dayIndex, endHour, endMin),
                title: customEvent.title,
            };
        });
    });
}

export const SHORT_DAYS = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

export const SHORT_DAY_REGEX = new RegExp(`(${SHORT_DAYS.join('|')})`, 'g');

/**
 * Parses a day string into an array of numbers.
 *
 * i.e. intended to be used in conjunction with {@link Date.getDay}
 *
 * @example 'MWF' -> [1, 3, 5]
 * @example 'TuTh' -> [2, 4]
 * @example 'MWFTh' -> [1, 3, 5, 4]
 */
export function parseDaysString(daysString: string | null): number[] | null {
    if (daysString == null) {
        return null;
    }

    const days: number[] = [];

    let match: RegExpExecArray | null;

    while ((match = SHORT_DAY_REGEX.exec(daysString))) {
        days.push(SHORT_DAYS.indexOf(match[1]));
    }

    return days;
}

interface NormalizedWebSOCTime {
    startTime: string;
    endTime: string;
}

/**
 * @param section
 * @returns The start and end time of a course in a 24 hour time with a leading zero (##:##).
 * @returns undefined if there is no WebSOC time (e.g. 'TBA', undefined)
 */
interface NormalizeTimeOptions {
    timeIsTBA?: boolean;
    startTime?: HourMinute | null;
    endTime?: HourMinute | null;
}

/**
 * @param section
 * @returns The start and end time of a course in a 24 hour time with a leading zero (##:##).
 * @returns undefined if there is no WebSOC time (e.g. 'TBA', undefined)
 */
export function normalizeTime(options: NormalizeTimeOptions): NormalizedWebSOCTime | undefined {
    if (options.timeIsTBA || !options.startTime || !options.endTime) {
        return;
    }

    // Times are normalized to ##:## (10:00, 09:00 etc)
    const startHour = `${options.startTime.hour}`.padStart(2, '0');
    const endHour = `${options.endTime.hour}`.padStart(2, '0');

    const startTime = `${startHour}:${options.startTime.minute}`;
    const endTime = `${endHour}:${options.endTime.minute}`;

    return { startTime, endTime };
}

export function translate24To12HourTime(startTime?: HourMinute, endTime?: HourMinute): string | undefined {
    if (!startTime || !endTime) {
        return;
    }

    const timeSuffix = endTime.hour >= 12 ? 'PM' : 'AM';

    const formattedStartHour = `${startTime.hour > 12 ? startTime.hour - 12 : startTime.hour}`;
    const formattedEndHour = `${endTime.hour > 12 ? endTime.hour - 12 : endTime.hour}`;

    const formattedStartMinute = `${startTime.minute}`;
    const formattedEndMinute = `${endTime.minute}`;

    const meetingStartTime = `${formattedStartHour}:${formattedStartMinute.padStart(2, '0')}`;
    const meetingEndTime = `${formattedEndHour}:${formattedEndMinute.padStart(2, '0')}`;

    return `${meetingStartTime} - ${meetingEndTime} ${timeSuffix}`;
}

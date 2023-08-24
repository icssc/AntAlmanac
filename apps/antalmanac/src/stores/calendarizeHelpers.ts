import { ScheduleCourse } from '@packages/antalmanac-types';
import { HourMinute } from 'peterportal-api-next-types';
import { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

export const calendarizeCourseEvents = (currentCourses: ScheduleCourse[] = []): CourseEvent[] => {
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
};

export const calendarizeFinals = (currentCourses: ScheduleCourse[] = []): CourseEvent[] => {
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
};

export const calendarizeCustomEvents = (currentCustomEvents: RepeatingCustomEvent[] = []): CustomEvent[] => {
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
};

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
    if (options.timeIsTBA) {
        return;
    }

    if (!options.startTime || !options.endTime) {
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

    const formattedStartMinute = `${startTime.minute}`.padStart(2, '0');
    const formattedEndMinute = `${endTime.minute}`.padStart(2, '0');

    const meetingStartTime = `${formattedStartHour}:${formattedStartMinute}`;
    const meetingEndTime = `${formattedEndHour}:${formattedEndMinute}`;

    const timeString = `${meetingStartTime} - ${meetingEndTime} ${timeSuffix}`;

    return timeString;
}

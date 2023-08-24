import { ScheduleCourse } from '@packages/antalmanac-types';
import { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

export const calendarizeCourseEvents = (currentCourses: ScheduleCourse[] = []) => {
    const courseEventsInCalendar: CourseEvent[] = [];

    for (const course of currentCourses) {
        for (const meeting of course.section.meetings) {
            if (!meeting.timeIsTBA) {
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

export const calendarizeFinals = (currentCourses: ScheduleCourse[] = []) => {
    const finalsEventsInCalendar: CourseEvent[] = [];

    for (const course of currentCourses) {
        const finalExam = course.section.finalExam;

        if (finalExam.examStatus == 'SCHEDULED_FINAL') {
            const date = finalExam.dayOfWeek;

            // TODO: this block is almost the same as in calenarizeCourseEvents. we should refactor to remove the duplicate code.
            const startHour = finalExam.startTime.hour;
            const startMin = finalExam.startTime.minute;
            const endHour = finalExam.endTime.hour;
            const endMin = finalExam.endTime.minute;

            const weekdayInclusion: boolean[] = [
                date.includes('Sat'),
                date.includes('Sun'),
                date.includes('Mon'),
                date.includes('Tue'),
                date.includes('Wed'),
                date.includes('Thu'),
                date.includes('Fri'),
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

export const calendarizeCustomEvents = (currentCustomEvents: RepeatingCustomEvent[] = []) => {
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

interface TranslatedWebSOCTime {
    startTime: string;
    endTime: string;
}

/**
 * @param time The time string.
 * @returns The start and end time of a course in a 24 hour time with a leading zero (##:##).
 * @returns undefined if there is no WebSOC time (e.g. 'TBA', undefined)
 */
export function translateWebSOCTimeTo24HourTime(time: string): TranslatedWebSOCTime | undefined {
    const timeString = time.replace(/\s/g, '');

    if (timeString !== 'TBA' && timeString !== undefined) {
        const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString.match(
            /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
        ) as RegExpMatchArray;

        let startHr = parseInt(startHrStr, 10);
        let endHr = parseInt(endHrStr, 10);

        if (ampm === 'p' && endHr !== 12) {
            startHr += 12;
            endHr += 12;
            if (startHr > endHr) startHr -= 12;
        }

        // Times are standardized to ##:## (i.e. leading zero) for correct comparisons as strings
        return {
            startTime: `${startHr < 10 ? `0${startHr}` : startHr}:${startMinStr}`,
            endTime: `${endHr < 10 ? `0${endHr}` : endHr}:${endMinStr}`,
        };
    }

    return undefined;
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
export function parseDaysString(daysString: string): number[] {
    const days: number[] = [];

    let match: RegExpExecArray | null;

    while ((match = SHORT_DAY_REGEX.exec(daysString))) {
        days.push(SHORT_DAYS.indexOf(match[1]));
    }

    return days;
}

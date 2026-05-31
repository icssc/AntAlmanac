import type { CourseEvent, CustomEvent, FinalExam, Location } from '$components/Calendar/types';
import { getReferencesOccurring } from '$lib/utils';
import type { ScheduleCourse, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { WEBSOC_DAYS } from '@packages/antalmanac-types';
import type { HourMinute } from '@packages/anteater-api/types';

export const SHORT_DAYS: string[] = [...WEBSOC_DAYS];

const FINALS_WEEK_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function getLocation(location: string): Location {
    const [building = '', room = ''] = location.split(' ');
    return { building, room };
}

function getDayIndicesOccurring(daysOccurring: boolean[]): number[] {
    const indices: number[] = [];
    for (let index = 0; index < daysOccurring.length; index++) {
        if (daysOccurring[index]) {
            indices.push(index);
        }
    }
    return indices;
}

function mapLocationsWithDay(bldg: string[], dayIndex: number, includeDays: boolean): Location[] {
    const locations: Location[] = [];
    for (const bldgEntry of bldg) {
        const location = getLocation(bldgEntry);
        locations.push({
            ...location,
            ...(includeDays && { days: SHORT_DAYS[dayIndex] }),
        });
    }
    return locations;
}

export const calendarizeCourseEvents = (currentCourses: ScheduleCourse[] = []): CourseEvent[] => {
    return currentCourses.flatMap((course) => {
        const term = course.term;
        const events: CourseEvent[] = [];

        for (const meeting of course.section.meetings) {
            if (meeting.timeIsTBA) {
                continue;
            }

            const startHour = meeting.startTime.hour;
            const startMin = meeting.startTime.minute;
            const endHour = meeting.endTime.hour;
            const endMin = meeting.endTime.minute;

            /**
             * An array of booleans indicating whether a course meeting occurs on that day.
             *
             * @example [false, true, false, true, false, true, false], i.e. [M, W, F]
             */
            const daysOccurring = getReferencesOccurring(SHORT_DAYS, meeting.days);

            /**
             * Only include the day indices that the meeting occurs.
             *
             * @example [false, true, false, true, false, true, false] -> [1, 3, 5]
             */
            const dayIndicesOccurring = getDayIndicesOccurring(daysOccurring);

            let finalExamField: FinalExam;
            if (course.section.finalExam.examStatus === 'SCHEDULED_FINAL') {
                const { bldg, ...finalExamWithoutBldg } = course.section.finalExam;
                finalExamField = {
                    ...finalExamWithoutBldg,
                    locations: bldg.map(getLocation),
                };
            } else {
                finalExamField = { examStatus: course.section.finalExam.examStatus };
            }

            for (const dayIndex of dayIndicesOccurring) {
                events.push({
                    color: course.section.color,
                    term,
                    title: `${course.deptCode} ${course.courseNumber}`,
                    deptValue: course.deptCode,
                    courseNumber: course.courseNumber,
                    courseTitle: course.courseTitle,
                    locations: mapLocationsWithDay(meeting.bldg, dayIndex, Boolean(meeting.days)),
                    showLocationInfo: false,
                    instructors: course.section.instructors,
                    sectionCode: course.section.sectionCode,
                    sectionType: course.section.sectionType,
                    start: new Date(2018, 0, dayIndex, startHour, startMin),
                    end: new Date(2018, 0, dayIndex, endHour, endMin),
                    finalExam: finalExamField,
                    isCustomEvent: false,
                });
            }
        }

        return events;
    });
};

export function calendarizeFinals(currentCourses: ScheduleCourse[] = []): CourseEvent[] {
    return currentCourses.flatMap((course) => {
        const sectionFinalExam = course.section.finalExam;
        if (sectionFinalExam.examStatus !== 'SCHEDULED_FINAL') {
            return [];
        }

        const { bldg, ...finalExam } = sectionFinalExam;

        const startHour = finalExam.startTime.hour;
        const startMin = finalExam.startTime.minute;
        const endHour = finalExam.endTime.hour;
        const endMin = finalExam.endTime.minute;

        /**
         * An array of booleans indicating whether the day at that index is a day that the final.
         *
         * @example [false, false, false, true, false, true, false], i.e. [T, Th]
         */
        const weekdaysOccurring = getReferencesOccurring(FINALS_WEEK_DAYS, finalExam.dayOfWeek);

        /**
         * Only include the day indices that the final is occurring.
         *
         * @example [false, false, false, true, false, true, false] -> [3, 5]
         */
        const dayIndicesOccurring = getDayIndicesOccurring(weekdaysOccurring);

        const locationsWithNoDays = bldg
            ? bldg.map(getLocation)
            : !course.section.meetings[0].timeIsTBA
              ? course.section.meetings[0].bldg.map(getLocation)
              : [];

        const term = course.term;
        const finalsStartDate = term.finalsStart;
        const finalExamLocations = bldg?.map(getLocation) ?? [];

        return dayIndicesOccurring.map((dayIndex) => {
            const startDate = new Date(finalsStartDate);
            startDate.setDate(finalsStartDate.getDate() + dayIndex);
            startDate.setHours(startHour, startMin);

            // Copy startDate, which already has the correct day
            const endDate = new Date(startDate);
            endDate.setHours(endHour, endMin);

            return {
                color: course.section.color,
                term,
                title: `${course.deptCode} ${course.courseNumber}`,
                courseTitle: course.courseTitle,
                locations: locationsWithNoDays.map((location: Location) => {
                    return {
                        ...location,
                        days: SHORT_DAYS[dayIndex],
                    };
                }),
                showLocationInfo: true,
                instructors: course.section.instructors,
                sectionCode: course.section.sectionCode,
                deptValue: course.deptCode,
                courseNumber: course.courseNumber,
                sectionType: 'Fin',
                start: startDate,
                end: endDate,
                finalExam: {
                    ...finalExam,
                    locations: finalExamLocations,
                },
                isCustomEvent: false,
            };
        });
    });
}

export function calendarizeCustomEvents(currentCustomEvents: RepeatingCustomEvent[] = []): CustomEvent[] {
    return currentCustomEvents.flatMap((customEvent) => {
        const startHour = parseInt(customEvent.start.slice(0, 2), 10);
        const startMin = parseInt(customEvent.start.slice(3, 5), 10);
        const endHour = parseInt(customEvent.end.slice(0, 2), 10);
        const endMin = parseInt(customEvent.end.slice(3, 5), 10);

        // Skip events whose time strings are not in HH:mm format (e.g. empty strings from the DB).
        if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) return [];

        const dayIndicesOccurring = getDayIndicesOccurring(customEvent.days);
        const days = dayIndicesOccurring.map((dayIndex) => SHORT_DAYS[dayIndex]);

        return dayIndicesOccurring.map((dayIndex) => {
            return {
                customEventID: customEvent.customEventID,
                color: customEvent.color ?? '#000000',
                start: new Date(2018, 0, dayIndex, startHour, startMin),
                isCustomEvent: true,
                end: new Date(2018, 0, dayIndex, endHour, endMin),
                title: customEvent.title,
                building: customEvent.building ?? '',
                days,
            };
        });
    });
}

const SHORT_DAY_REGEX = new RegExp(`(${SHORT_DAYS.join('|')})`, 'g');

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

export function formatTimes(startTime: HourMinute, endTime: HourMinute, timeFormat: boolean): string | undefined {
    if (!startTime || !endTime) {
        return;
    }

    const formattedStartMinute = startTime.minute.toString().padStart(2, '0');
    const formattedEndMinute = endTime.minute.toString().padStart(2, '0');

    if (timeFormat) {
        return `${startTime.hour}:${formattedStartMinute} - ${endTime.hour}:${formattedEndMinute}`;
    }

    const timeSuffix = endTime.hour >= 12 ? 'PM' : 'AM';

    const formattedStartHour = `${startTime.hour > 12 ? startTime.hour - 12 : startTime.hour}`;
    const formattedEndHour = `${endTime.hour > 12 ? endTime.hour - 12 : endTime.hour}`;

    const meetingStartTime = `${formattedStartHour}:${formattedStartMinute}`;
    const meetingEndTime = `${formattedEndHour}:${formattedEndMinute}`;

    return `${meetingStartTime} - ${meetingEndTime} ${timeSuffix}`;
}

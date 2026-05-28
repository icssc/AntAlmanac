import type { CourseEvent, CustomEvent, FinalExam, Location } from '$components/Calendar/types';
import { getReferencesOccurring } from '$lib/utils';
import type { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';
import type { HourMinute } from '@packages/anteater-api/types';

export const COURSE_WEEK_DAYS = WEBSOC_DAYS;

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
            ...(includeDays && { days: COURSE_WEEK_DAYS[dayIndex] }),
        });
    }
    return locations;
}

export const calendarizeCourseEvents = (currentCourses: AACourseWithTerm[] = []): CourseEvent[] => {
    return currentCourses.flatMap((course) => {
        const term = course.term;

        return course.sections.flatMap((section) => {
            const events: CourseEvent[] = [];

            for (const meeting of section.meetings) {
                if (meeting.timeIsTBA) {
                    continue;
                }

                const startHour = meeting.startTime.hour;
                const startMin = meeting.startTime.minute;
                const endHour = meeting.endTime.hour;
                const endMin = meeting.endTime.minute;

                const daysOccurring = getReferencesOccurring(COURSE_WEEK_DAYS, meeting.days);
                const dayIndicesOccurring = getDayIndicesOccurring(daysOccurring);

                let finalExamField: FinalExam;
                if (section.finalExam.examStatus === 'SCHEDULED_FINAL') {
                    const { bldg, ...finalExamWithoutBldg } = section.finalExam;
                    finalExamField = {
                        ...finalExamWithoutBldg,
                        locations: bldg.map(getLocation),
                    };
                } else {
                    finalExamField = { examStatus: section.finalExam.examStatus };
                }

                for (const dayIndex of dayIndicesOccurring) {
                    events.push({
                        color: section.color,
                        term,
                        title: `${course.deptCode} ${course.courseNumber}`,
                        deptValue: course.deptCode,
                        courseNumber: course.courseNumber,
                        courseTitle: course.courseTitle,
                        locations: mapLocationsWithDay(meeting.bldg, dayIndex, Boolean(meeting.days)),
                        showLocationInfo: false,
                        instructors: section.instructors,
                        sectionCode: section.sectionCode,
                        sectionType: section.sectionType,
                        start: new Date(2018, 0, dayIndex, startHour, startMin),
                        end: new Date(2018, 0, dayIndex, endHour, endMin),
                        finalExam: finalExamField,
                        eventKind: 'course',
                    });
                }
            }

            return events;
        });
    });
};

export function calendarizeFinals(currentCourses: AACourseWithTerm[] = []): CourseEvent[] {
    return currentCourses.flatMap((course) =>
        course.sections.flatMap((section) => {
            const sectionFinalExam = section.finalExam;
            if (sectionFinalExam.examStatus !== 'SCHEDULED_FINAL') {
                return [];
            }

            const { bldg, ...finalExam } = sectionFinalExam;

            const startHour = finalExam.startTime.hour;
            const startMin = finalExam.startTime.minute;
            const endHour = finalExam.endTime.hour;
            const endMin = finalExam.endTime.minute;

            const weekdaysOccurring = getReferencesOccurring(FINALS_WEEK_DAYS, finalExam.dayOfWeek);
            const dayIndicesOccurring = getDayIndicesOccurring(weekdaysOccurring);

            const locationsWithNoDays = bldg
                ? bldg.map(getLocation)
                : !section.meetings[0].timeIsTBA
                  ? section.meetings[0].bldg.map(getLocation)
                  : [];

            const term = course.term;
            const finalsStartDate = term.finalsStart;
            const finalExamLocations = bldg?.map(getLocation) ?? [];

            return dayIndicesOccurring.map((dayIndex) => {
                const startDate = new Date(finalsStartDate);
                startDate.setDate(finalsStartDate.getDate() + dayIndex);
                startDate.setHours(startHour, startMin);

                const endDate = new Date(startDate);
                endDate.setHours(endHour, endMin);

                return {
                    color: section.color,
                    term,
                    title: `${course.deptCode} ${course.courseNumber}`,
                    courseTitle: course.courseTitle,
                    locations: locationsWithNoDays.map((location: Location) => ({
                        ...location,
                        days: COURSE_WEEK_DAYS[dayIndex],
                    })),
                    showLocationInfo: true,
                    instructors: section.instructors,
                    sectionCode: section.sectionCode,
                    deptValue: course.deptCode,
                    courseNumber: course.courseNumber,
                    sectionType: 'Fin',
                    start: startDate,
                    end: endDate,
                    finalExam: {
                        ...finalExam,
                        locations: finalExamLocations,
                    },
                    eventKind: 'course',
                };
            });
        })
    );
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
        const days = dayIndicesOccurring.map((dayIndex) => COURSE_WEEK_DAYS[dayIndex]);

        return dayIndicesOccurring.map((dayIndex) => {
            return {
                customEventID: customEvent.customEventID,
                color: customEvent.color ?? '#000000',
                start: new Date(2018, 0, dayIndex, startHour, startMin),
                eventKind: 'custom',
                end: new Date(2018, 0, dayIndex, endHour, endMin),
                title: customEvent.title,
                building: customEvent.building ?? '',
                days,
            };
        });
    });
}

const SHORT_DAY_REGEX = new RegExp(`(${COURSE_WEEK_DAYS.join('|')})`, 'g');

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
        const matchedDay = match[1];
        days.push(COURSE_WEEK_DAYS.findIndex((day) => day === matchedDay));
    }

    return days;
}

interface NormalizedWebSOCTime {
    startTime: string;
    endTime: string;
}

interface NormalizeTimeOptions {
    timeIsTBA?: boolean;
    startTime?: HourMinute | null;
    endTime?: HourMinute | null;
}

/**
 * @returns Start and end time as 24-hour strings with leading zeros (##:##),
 * or undefined when time is TBA or missing.
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

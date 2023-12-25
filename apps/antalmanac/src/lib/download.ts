import type { Course, HourMinute, WebsocSectionFinalExam } from 'peterportal-api-next-types';
import { saveAs } from 'file-saver';
import { createEvents, type EventAttributes } from 'ics';
import { notNull } from './utils';
import { openSnackbar } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { getDefaultTerm, termData } from '$lib/termData';
import { CourseEvent, CustomEvent, FinalExam } from '$components/Calendar/CourseCalendarEvent';
import AppStore from '$stores/AppStore';

export const quarterStartDates = Object.fromEntries(
    termData
        .filter((term) => term.startDate !== undefined)
        .map((term) => [term.shortName, term.startDate as [number, number, number]])
);

export const months: Record<string, number> = { Mar: 3, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Dec: 12 };

export const daysOfWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'] as const;

export const daysOffset: Record<string, number> = { SU: -1, MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5 };

export const fallDaysOffset: Record<string, number> = { TH: 0, FR: 1, SA: 2, SU: 3, MO: 4, TU: 5, WE: 6 };

export const translateDaysForIcs = { Su: 'SU', M: 'MO', Tu: 'TU', W: 'WE', Th: 'TH', F: 'FR', Sa: 'SA' };

export const vTimeZoneSection =
    'BEGIN:VTIMEZONE\n' +
    'TZID:America/Los_Angeles\n' +
    'X-LIC-LOCATION:America/Los_Angeles\n' +
    'BEGIN:DAYLIGHT\n' +
    'TZOFFSETFROM:-0800\n' +
    'TZOFFSETTO:-0700\n' +
    'TZNAME:PDT\n' +
    'DTSTART:19700308T020000\n' +
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\n' +
    'END:DAYLIGHT\n' +
    'BEGIN:STANDARD\n' +
    'TZOFFSETFROM:-0700\n' +
    'TZOFFSETTO:-0800\n' +
    'TZNAME:PST\n' +
    'DTSTART:19701101T020000\n' +
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\n' +
    'END:STANDARD\n' +
    'END:VTIMEZONE\n' +
    'BEGIN:VEVENT';

export const CALENDAR_ID = 'antalmanac/ics';

export const CALENDAR_OUTPUT = 'local' as const;

/**
 * @example [YEAR, MONTH, DAY, HOUR, MINUTE]
 */
export type DateTimeArray = [number, number, number, number, number];

/**
 * @example [YEAR, MONTH, DAY]
 */
export type YearMonthDay = [number, number, number];

/**
 * Get the days that a class occurs.
 * Given a string of days, convert it to a list of days in ics format
 *
 * @example ("TuThF") -> ["TU", "TH", "FR"]
 */
export function getByDays(days: string): string[] {
    return daysOfWeek.filter((day) => days.includes(day)).map((day) => translateDaysForIcs[day]);
}

/**
 * Get the start date of a class
 * Given the term and bydays, this computes the start date of the class.
 *
 * @example ("2021 Spring", 'Tu') -> [2021, 3, 30]
 */
export function getClassStartDate(term: string, bydays: string[]) {
    // Get the start date of the quarter (Monday)
    const quarterStartDate = new Date(...quarterStartDates[term]);

    // The number of days since the start of the quarter.
    let dayOffset: number;

    // Since Fall quarter starts on a Thursday,
    // the first byday and offset will be different from other quarters.
    // Sort by this ordering: [TH, FR, SA, SU, MO, TU, WE]
    if (getQuarter(term) === 'Fall') {
        bydays.sort((day1, day2) => {
            return fallDaysOffset[day1] - fallDaysOffset[day2];
        });
        dayOffset = fallDaysOffset[bydays[0]];
    } else {
        dayOffset = daysOffset[bydays[0]];
    }

    // Add the dayOffset to the quarterStartDate
    // Date object will handle potential overflow into the next month
    quarterStartDate.setDate(quarterStartDate.getDate() + dayOffset);

    // Return [Year, Month, Date]
    return dateToIcs(quarterStartDate);
}

/**
 * Convert a Date object to ics format, i.e. [YYYY, MM, DD]
 */
export function dateToIcs(date: Date) {
    return [
        date.getFullYear(),
        date.getMonth() + 1, // Add 1 month since it is 0-indexed
        date.getDate(),
    ] as YearMonthDay;
}

/**
 * Get the start and end datetime of the first class.
 *
 * @example ([2021, 3, 30], " 4:00-4:50p") -> [[2021, 3, 30, 16, 0], [2021, 3, 30, 16, 50]]
 */
export function getFirstClass(
    date: YearMonthDay,
    startTime: HourMinute,
    endTime: HourMinute
): [DateTimeArray, DateTimeArray] {
    const [classStartTime, classEndTime] = parseTimes(startTime, endTime);
    return [
        [...date, ...classStartTime],
        [...date, ...classEndTime],
    ];
}

/**
 * Get the start and end datetime of an exam
 *
 * @example
 *
 * ```ts
 * const exam = {
 *   month: 6,
 *   day: 7,
 *   startTime: {
 *      hour: 10,
 *      minute: 30,
 *   },
 *   endTime: {
 *     hour: 12,
 *     minute: 30,
 *   },
 *   ...
 * }
 *
 * const year = 2019
 *
 * const [examStart, examEnd] = getExamTime(exam, year)
 *
 * // examStart = [2019, 6, 7, 10, 30]
 * // examEnd = [2019, 6, 7, 12, 30]
 * ```
 */
export function getExamTime(exam: FinalExam, year: number): [DateTimeArray, DateTimeArray] | [] {
    if (exam.month && exam.day && exam.startTime && exam.endTime) {
        const month = exam.month;
        const day = exam.day;
        const [examStartTime, examEndTime] = parseTimes(exam.startTime, exam.endTime);

        return [
            [year, month + 1, day, ...examStartTime],
            [year, month + 1, day, ...examEndTime],
        ];
    } else {
        // This should never happen, but we return an empty array for typescript purposes
        return [];
    }
}

/**
 * Helper to convert a time string to an array format.
 *
 * @example { hour: 16, minute: 0}, { hour: 16, minute: 50 } -> [[16, 0], [16, 50]]
 */
export function parseTimes(startTime: HourMinute, endTime: HourMinute) {
    return [
        [startTime.hour, startTime.minute],
        [endTime.hour, endTime.minute],
    ] as const;
}

/**
 * Get the year of a given term.
 *
 * @example "2019 Fall" -> "2019"
 */
export function getYear(term: string) {
    return parseInt(term.split(' ')[0]);
}

/**
 * Get the quarter of a given term.
 *
 * @example "2019 Fall" -> "Fall"
 */
export function getQuarter(term: string) {
    return term.split(' ')[1];
}

/**
 * Get the number of weeks in a given term.
 *
 * @example 10 for quarters and Summer Session 10wk, 5 for Summer Sessions I and II.
 */
export function getTermLength(quarter: string) {
    return quarter.startsWith('Summer') && quarter !== 'Summer10wk' ? 5 : 10;
}

/**
 * Get a string representing the recurring rule for the VEvent.
 *
 * @example ["TU", "TH"] -> "FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=1;COUNT=20"
 */
export function getRRule(bydays: string[], quarter: string) {
    /**
     * Number of occurences in the quarter
     */
    let count = getTermLength(quarter) * bydays.length;

    switch (quarter) {
        case 'Fall':
            for (const byday of bydays) {
                switch (byday) {
                    case 'TH':
                    case 'FR':
                    case 'SA':
                        count += 1; // account for Week 0 course meetings
                        break;
                    default:
                        break;
                }
            }
            break;
        case 'Summer1':
            if (bydays.includes('MO')) count += 1; // instruction ends Monday of Week 6
            break;
        case 'Summer10wk':
            if (bydays.includes('FR')) count -= 1; // instruction ends Thursday of Week 10
            break;
        default:
            break;
    }

    return `FREQ=WEEKLY;BYDAY=${bydays.toString()};INTERVAL=1;COUNT=${count}`;
}

export function getEventsFromCourses(events = AppStore.getEventsWithFinalsInCalendar()): EventAttributes[] {
    const calendarEvents = events.flatMap((event) => {
        if (event.isCustomEvent) {
            // FIXME: We don't have a way to get the term for custom events,
            // so we just use the default term.
            const { title, start, end } = event as CustomEvent;
            const days = getByDays(event.days.join(''));
            const term = getDefaultTerm().shortName;
            const rrule = getRRule(days, getQuarter(term));
            const eventStartDate = getClassStartDate(term, days);
            const [firstClassStart, firstClassEnd] = getFirstClass(
                eventStartDate,
                { hour: start.getHours(), minute: start.getMinutes() },
                { hour: end.getHours(), minute: end.getMinutes() }
            );
            const customEvent: EventAttributes = {
                productId: 'antalmanac/ics',
                startOutputType: 'local' as const,
                endOutputType: 'local' as const,
                title: title,
                // TODO: Add location to custom events, waiting for https://github.com/icssc/AntAlmanac/issues/249
                // location: `${location.building} ${location.room}`,
                start: firstClassStart,
                end: firstClassEnd,
                recurrenceRule: rrule,
            };
            return customEvent;
        } else {
            const { term, title, courseTitle, instructors, sectionType, start, end, finalExam } = event;
            const courseEvents: EventAttributes[] = event.locations
                .map((location) => {
                    if (location.days === undefined) {
                        return null;
                    }
                    const days = getByDays(location.days);

                    const [finalStart, finalEnd] = getExamTime(finalExam, getYear(term));

                    if (sectionType === 'Fin') {
                        return {
                            productId: CALENDAR_ID,
                            startOutputType: CALENDAR_OUTPUT,
                            endOutputType: CALENDAR_OUTPUT,
                            title: `${title} Final Exam`,
                            description: `Final Exam for ${courseTitle}`,
                            start: finalStart!,
                            end: finalEnd!,
                        };
                    } else {
                        const classStartDate = getClassStartDate(term, days);

                        const [firstClassStart, firstClassEnd] = getFirstClass(
                            classStartDate,
                            { hour: start.getHours(), minute: start.getMinutes() },
                            { hour: end.getHours(), minute: end.getMinutes() }
                        );

                        const rrule = getRRule(days, getQuarter(term));

                        // Add VEvent to events array.
                        return {
                            productId: 'antalmanac/ics',
                            startOutputType: 'local' as const,
                            endOutputType: 'local' as const,
                            title: `${title} ${sectionType}`,
                            description: `${courseTitle}\nTaught by ${instructors.join('/')}`,
                            location: `${location.building} ${location.room}`,
                            start: firstClassStart,
                            end: firstClassEnd,
                            recurrenceRule: rrule,
                        };
                    }
                })
                .filter(notNull);
            return courseEvents;
        }
    });
    return calendarEvents;
}

export function exportCalendar() {
    const events = getEventsFromCourses();

    // Convert the events into a vcalendar.
    // Callback function triggers a download of the .ics file
    createEvents(events, (error, value) => {
        logAnalytics({
            category: 'Calendar Pane',
            action: analyticsEnum.calendar.actions.DOWNLOAD,
        });

        if (error) {
            openSnackbar('error', 'Something went wrong! Unable to download schedule.', 5);
            console.log(error);
            return;
        }

        // Add timezone information to start and end times for events
        const icsString = value
            .replaceAll('DTSTART', 'DTSTART;TZID=America/Los_Angeles')
            .replaceAll('DTEND', 'DTEND;TZID=America/Los_Angeles');

        // Inject the VTIMEZONE section into the .ics file.
        const data = new Blob([icsString.replace('BEGIN:VEVENT', vTimeZoneSection)], {
            type: 'text/plain;charset=utf-8',
        });

        // Download the .ics file
        saveAs(data, 'schedule.ics');
        openSnackbar('success', 'Schedule downloaded!', 5);
    });
}

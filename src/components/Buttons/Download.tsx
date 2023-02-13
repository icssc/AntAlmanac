import { useRef } from 'react';
import { createEvents } from 'ics';
import { useSnackbar } from 'notistack';
import { Button, Link, Tooltip } from '@mui/material';
import { Today as TodayIcon } from '@mui/icons-material';
import { termData } from '$lib/termData';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$stores/schedule';

const quarterStartDates = Object.fromEntries(
  termData
    .filter((term) => term.startDate !== undefined)
    .map((term) => [term.shortName, term.startDate as [number, number, number]])
);

const months: Record<string, number> = { Mar: 3, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Dec: 12 };

const daysOfWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'] as const;

const daysOffset: Record<string, number> = { SU: -1, MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5 };

const fallDaysOffset: Record<string, number> = { TH: 0, FR: 1, SA: 2, SU: 3, MO: 4, TU: 5, WE: 6 };

const translateDaysForIcs = { Su: 'SU', M: 'MO', Tu: 'TU', W: 'WE', Th: 'TH', F: 'FR', Sa: 'SA' };

const vTimeZoneSection =
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

/**
 * [YEAR, MONTH, DAY, HOUR, MINUTE]
 */
type DateTimeArray = [number, number, number, number, number];

/**
 * [YEAR, MONTH, DAY]
 */
type YearMonthDay = [number, number, number];

/**
 * [HOUR, MINUTE]
 */
type HourMinute = [number, number];

/**
 * convert Date to ICS format [YYYY, MM, DD]
 */
function dateToIcs(date: Date) {
  const icsDate: YearMonthDay = [
    date.getFullYear(),
    date.getMonth() + 1, // Month is 0-indexed; add 1
    date.getDate(),
  ];
  return icsDate;
}

/**
 * convert list of days embedded in string to an array of days in ICS format
 * @param days string representing all the days the class occurs
 * @example "TuThF" -> ["TU", "TH", "FR"]
 */

function getByDays(days: string) {
  return daysOfWeek.filter((day) => days.includes(day)).map((day) => translateDaysForIcs[day]);
}

/**
 * getQuarter returns the quarter of a given term
 * @example "2019 Fall" -> "Fall"
 */
const getQuarter = (term: string) => {
  return term.split(' ')[1];
};

/**
 * getClassStartDate returns the start date of a class
 * Given the term and bydays, this computes the start date of the class
 * Ex: ("2021 Spring", 'Tu') -> [2021, 3, 30]
 */
function getClassStartDate(term: string, bydays: string[]) {
  /**
   * start date of the quarter (Monday)
   */
  const quarterStartDate = new Date(...quarterStartDates[term]);

  /**
   * number of days since the start of the quarter
   */
  let dayOffset =
    getQuarter(term) === 'Fall'
      ? fallDaysOffset[bydays.sort((day1, day2) => fallDaysOffset[day1] - fallDaysOffset[day2])[0]]
      : daysOffset[bydays[0]];

  /**
   * add the dayOffset to the quarterStartDate
   * Date object will handle potential overflow into the next month
   */
  quarterStartDate.setDate(quarterStartDate.getDate() + dayOffset);

  return dateToIcs(quarterStartDate);
}

/**
 * parseTimes converts a time string to a
 * This is a helper function used by getFirstClass
 * @example "4:00-4:50p" -> [[16, 0], [16, 50]]
 */
function parseTimes(time: string) {
  // Determine whether the time is in the afternoon (PM)
  let pm = false;
  if (time.slice(-1) === 'p') {
    // Course time strings would end with a 'p'
    time = time.substring(0, time.length - 1); // Remove 'p' from the end
    pm = true;
  } else if (time.slice(-2) === 'pm') {
    // Final Exam time strings would end with a 'pm'
    time = time.substring(0, time.length - 2); // Remove 'pm' from the end
    pm = true;
  }

  // Get the [start, end] times in [hour, minute] format
  const [start, end] = time
    .split('-') // Ex: [" 4:00", "4:50"]
    .map(
      (timeString) =>
        timeString
          .split(':') // Ex: [[" 4", "00"], ["4", "50"]]
          .map((val) => parseInt(val)) as HourMinute // Ex: [[4, 0], [4, 50]]
    );

  // Add 12 hours if the time is PM
  // However don't add 12 if it is noon
  if (pm && end[0] !== 12) {
    // Only add 12 to start if start is greater than end
    // We don't want to add 12 if the start is in the AM
    //  E.g. 11:00-12:00 => don't add 12 to start
    //  E.g. 1:00-2:00 => add 12 to start
    if (start[0] <= end[0]) {
      start[0] += 12;
    }
    end[0] += 12;
  }

  return [start, end] as const;
}

function getExamTime(exam: string, year: number) {
  const [, month, day, time] = exam.split(' ');
  const [examStartTime, examEndTime] = parseTimes(time);

  return [
    [year, months[month], parseInt(day), ...examStartTime],
    [year, months[month], parseInt(day), ...examEndTime],
  ];
}

/**
 * returns the year of a given term
 * @example "2019 Fall" -> "2019"
 */
function getYear(term: string) {
  return parseInt(term.split(' ')[0]);
}

/**
 * getTermLength returns the number of weeks in a given term,
 * which is 10 for quarters and Summer Session 10wk,
 * and 5 for Summer Sessions I and II
 */
function getTermLength(quarter: string) {
  return quarter.startsWith('Summer') && quarter !== 'Summer10wk' ? 5 : 10;
}

/**
 * return the start and end datetime of the first class
 * @example ([2021, 3, 30], " 4:00-4:50p") -> [[2021, 3, 30, 16, 0], [2021, 3, 30, 16, 50]]
 */
function getFirstClass(date: YearMonthDay, time: string): [DateTimeArray, DateTimeArray] {
  const [classStartTime, classEndTime] = parseTimes(time);
  return [
    [...date, ...classStartTime],
    [...date, ...classEndTime],
  ];
}

/**
 * getRRule returns a string representing the recurring rule for the VEvent
 * @example ["TU", "TH"] -> "FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=1;COUNT=20"
 */
function getRRule(bydays: ReturnType<typeof getByDays>, quarter: string) {
  let count = getTermLength(quarter) * bydays.length; // Number of occurences in the quarter
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

export default function Download() {
  const { currentCourses } = useScheduleStore();
  const { enqueueSnackbar } = useSnackbar();
  const ref = useRef<HTMLAnchorElement>(null);

  function exportCalendar() {
    // get courses for the current schedule
    const courses = currentCourses();

    // Construct an array of VEvents for each event
    const events = [];
    for (const course of courses) {
      const {
        term,
        deptCode,
        courseNumber,
        courseTitle,
        section: { sectionType, instructors, meetings, finalExam },
      } = course;

      // Create a VEvent for each meeting
      for (const meeting of meetings) {
        if (meeting.time === 'TBA') {
          // Skip this meeting if there is no meeting time
          continue;
        }
        const bydays = getByDays(meeting.days);
        const classStartDate = getClassStartDate(term, bydays);
        const [firstClassStart, firstClassEnd] = getFirstClass(classStartDate, meeting.time);
        const rrule = getRRule(bydays, getQuarter(term));

        // Add VEvent to events array
        events.push({
          productId: 'antalmanac/ics',
          startOutputType: 'local' as const,
          endOutputType: 'local' as const,
          title: `${deptCode} ${courseNumber} ${sectionType}`,
          description: `${courseTitle}\nTaught by ${instructors.join('/')}`,
          location: `${meeting.bldg}`,
          start: firstClassStart as DateTimeArray,
          end: firstClassEnd as DateTimeArray,
          recurrenceRule: rrule,
        });
      }

      // Add Final to events
      if (finalExam && finalExam !== 'TBA') {
        const [examStart, examEnd] = getExamTime(finalExam, getYear(term));
        events.push({
          productId: 'antalmanac/ics',
          startOutputType: 'local' as const,
          endOutputType: 'local' as const,
          title: `${deptCode} ${courseNumber} Final Exam`,
          description: `Final Exam for ${courseTitle}`,
          start: examStart as DateTimeArray,
          end: examEnd as DateTimeArray,
        });
      }
    }

    /**
     * Convert the events into a vcalendar
     * Callback function triggers a download of the .ics file
     */
    createEvents(events, (err, val) => {
      logAnalytics({
        category: 'Calendar Pane',
        action: analyticsEnum.calendar.actions.DOWNLOAD,
      });

      if (!err) {
        // Add timezone information to start and end times for events
        const icsString = val
          .replaceAll('DTSTART', 'DTSTART;TZID=America/Los_Angeles')
          .replaceAll('DTEND', 'DTEND;TZID=America/Los_Angeles');

        // Download the .ics file
        saveAs(
          // inject the VTIMEZONE section into the .ics file
          new Blob([icsString.replace('BEGIN:VEVENT', vTimeZoneSection)], { type: 'text/plain;charset=utf-8' }),
          'schedule.ics'
        );

        enqueueSnackbar('Schedule downloaded!', {
          variant: 'success',
        });
      } else {
        enqueueSnackbar('Something went wrong! Unable to download schedule.', {
          variant: 'error',
        });
        console.log(err);
      }
    });
  }

  function saveAs(uri: any, download: string) {
    if (!ref.current) {
      return;
    }
    const href = URL.createObjectURL(uri);
    ref.current.href = href;
    ref.current.download = download;
    ref.current.click();
  }

  return (
    <>
      <Tooltip title="Download Calendar as an .ics file">
        <Button onClick={exportCalendar} variant="outlined" size="small" startIcon={<TodayIcon fontSize="small" />}>
          Download
        </Button>
      </Tooltip>
      <Link ref={ref} sx={{ display: 'none' }} />
    </>
  );
}

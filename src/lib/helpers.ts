import { AppStoreCourse, CourseEvent, RepeatingCustomEvent, ZotCustomEvent } from '../types';

/**
 * @param courseNumber represents the course number of a course (eg. '122A', '121')
 * @returns an int or number with a decimal representation of the passed in string
 * @example courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121
 */
export function courseNumAsDecimal(courseNumber: string) {
  /**
   * split the course detail number into letters and digits
   */
  const courseNumArr = courseNumber.split(/(\d+)/);

  /**
   * get rid of empty strings in courseNumArr
   */
  const filtered = courseNumArr.filter((value) => value !== '');

  /**
   * Return 0 if array is empty
   */
  if (filtered.length === 0) {
    console.error(`No characters were found, returning 0, Input: ${courseNumber}`);
    return 0;
  }

  /**
   * won't affect numeric characters
   */
  const lastElement = filtered[filtered.length - 1].toUpperCase();

  /**
   * checks first character of the last element
   */
  const lastElementCharCode = lastElement.charCodeAt(0);

  /**
   * return last element of the filtered array if it's an integer
   */
  if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
    return parseInt(lastElement);
  }

  /**
   * If the string does not have any numeric characters
   */
  if (filtered.length === 1) {
    console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`);
    return 0;
  }

  /**
   * string of numeric characters
   */
  const secondToLastElement = filtered[filtered.length - 2];

  /**
   * characters within [A-I] or [a-i] will be converted to 1-9, respectively
   */
  const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  if (1 <= letterAsNumber && letterAsNumber <= 9) {
    return parseFloat(`${secondToLastElement}.${letterAsNumber}`);
  } else {
    console.error(
      `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
        filtered[filtered.length - 1][0]
      }, Input: ${courseNumber}`
    );

    /**
     * should be an integer because string was initially split into strings of digits
     * if last element in the array is not integer, then second to last should be
     */
    return parseInt(secondToLastElement);
  }
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @param scheduleNames names of the schedules
 * @returns schedule names mapped to the section codes and course term
 */
export function getSectionCodes(addedCourses: AppStoreCourse[], scheduleNames: string[]) {
  const addedSectionCodes = {};

  for (let i = 0; i < scheduleNames.length; i++) {
    addedSectionCodes[i] = new Set();
  }

  for (const course of addedCourses) {
    for (const scheduleIndex of course.scheduleIndices) {
      addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
    }
  }
  return addedSectionCodes;
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @returns an array of course events that can be added to the calendar
 */
export function calendarizeCourseEvents(addedCourses: AppStoreCourse[]) {
  const courseEventsInCalendar: CourseEvent[] = [];

  for (const course of addedCourses) {
    for (const meeting of course.section.meetings) {
      const timeString = meeting.time.replace(/\s/g, '');

      if (timeString !== 'TBA') {
        const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString.match(
          /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
        ) as RegExpMatchArray;

        let startHr = parseInt(startHrStr, 10);
        const startMin = parseInt(startMinStr, 10);
        let endHr = parseInt(endHrStr, 10);
        const endMin = parseInt(endMinStr, 10);

        const dates = [
          meeting.days.includes('Su'),
          meeting.days.includes('M'),
          meeting.days.includes('Tu'),
          meeting.days.includes('W'),
          meeting.days.includes('Th'),
          meeting.days.includes('F'),
          meeting.days.includes('Sa'),
        ];

        if (ampm === 'p' && endHr !== 12) {
          startHr += 12;
          endHr += 12;
          if (startHr > endHr) startHr -= 12;
        }

        dates.forEach((shouldBeInCal, index) => {
          if (shouldBeInCal) {
            const newEvent = {
              color: course.color,
              term: course.term,
              title: course.deptCode + ' ' + course.courseNumber,
              courseTitle: course.courseTitle,
              bldg: meeting.bldg,
              instructors: course.section.instructors,
              sectionCode: course.section.sectionCode,
              sectionType: course.section.sectionType,
              start: new Date(2018, 0, index, startHr, startMin),
              finalExam: course.section.finalExam,
              end: new Date(2018, 0, index, endHr, endMin),
              isCustomEvent: false as const,
              scheduleIndices: course.scheduleIndices,
            };

            courseEventsInCalendar.push(newEvent as any);
          }
        });
      }
    }
  }

  return courseEventsInCalendar;
}

/**
 * @param customEvents custom events that have been added to the schedule
 * @returns an array of calendar events
 */
export function calendarizeCustomEvents(customEvents: RepeatingCustomEvent[]) {
  const customEventsInCalendar: ZotCustomEvent[] = [];

  for (const customEvent of customEvents) {
    for (let dayIndex = 0; dayIndex < customEvent.days.length; dayIndex++) {
      if (customEvent.days[dayIndex]) {
        const startHour = parseInt(customEvent.start.slice(0, 2), 10);
        const startMin = parseInt(customEvent.start.slice(3, 5), 10);
        const endHour = parseInt(customEvent.end.slice(0, 2), 10);
        const endMin = parseInt(customEvent.end.slice(3, 5), 10);

        customEventsInCalendar.push({
          customEventID: customEvent.customEventID,
          color: customEvent.color || '',
          start: new Date(2018, 0, dayIndex, startHour, startMin),
          isCustomEvent: true,
          end: new Date(2018, 0, dayIndex, endHour, endMin),
          scheduleIndices: customEvent.scheduleIndices,
          title: customEvent.title,
        });
      }
    }
  }

  return customEventsInCalendar as ZotCustomEvent[];
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @returns an array of calendar events
 */
export function calendarizeFinals(addedCourses: AppStoreCourse[]) {
  const finalsEventsInCalendar = [] as CourseEvent[];

  for (const course of addedCourses) {
    const finalExam = course.section.finalExam;
    if (finalExam.length > 5) {
      const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = finalExam.match(
        /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
      ) as RegExpMatchArray;
      // TODO: this block is almost the same as in calenarizeCourseEvents. we should refactor to remove the duplicate code.
      let startHour = parseInt(startStr, 10);
      const startMin = parseInt(startMinStr, 10);
      let endHour = parseInt(endStr, 10);
      const endMin = parseInt(endMinStr, 10);
      const weekdayInclusion: boolean[] = [
        date.includes('Sat'),
        date.includes('Sun'),
        date.includes('Mon'),
        date.includes('Tue'),
        date.includes('Wed'),
        date.includes('Thu'),
        date.includes('Fri'),
      ];
      if (ampm === 'pm' && endHour !== 12) {
        startHour += 12;
        endHour += 12;
        if (startHour > endHour) startHour -= 12;
      }

      weekdayInclusion.forEach((shouldBeInCal, index) => {
        if (shouldBeInCal)
          finalsEventsInCalendar.push({
            title: course.deptCode + ' ' + course.courseNumber,
            sectionCode: course.section.sectionCode,
            sectionType: 'Fin',
            bldg: course.section.meetings[0].bldg,
            color: course.color,
            scheduleIndices: course.scheduleIndices,
            start: new Date(2018, 0, index - 1, startHour, startMin),
            end: new Date(2018, 0, index - 1, endHour, endMin),
            finalExam: course.section.finalExam,
            instructors: course.section.instructors,
            term: course.term,
            isCustomEvent: false,
          } as any);
      });
    }
  }
  return finalsEventsInCalendar;
}

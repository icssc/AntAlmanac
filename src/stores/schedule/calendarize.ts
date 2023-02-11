/**
 * helpers to convert courses or events to calendar events
 */

import type { Course, RepeatingCustomEvent } from '.';

/**
 * parses a course meeting time into numerical components
 */
function meetingTimeToCalendarTimes(meetingTime: string) {
  const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = meetingTime.match(
    /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
  );

  let startHr = parseInt(startHrStr, 10);
  const startMin = parseInt(startMinStr, 10);
  let endHr = parseInt(endHrStr, 10);
  const endMin = parseInt(endMinStr, 10);

  if (ampm === 'p' && endHr !== 12) {
    startHr += 12;
    endHr += 12;
    if (startHr > endHr) startHr -= 12;
  }

  return {
    startHr,
    startMin,
    endHr,
    endMin,
  };
}

/**
 * returns course meeting days as calendar events from courses
 */
export const calendarizeCourseEvents = (currentCourses: Course[]) =>
  currentCourses
    /**
     * map each course to an array of calendar events representing all the meeting days
     */
    .map((course) =>
      /**
       * each course maps to an array of calendar events
       */
      course.section.meetings
        /**
         * convert the meeting time to a version with removed whitespace
         */
        .map((meeting) => ({ ...meeting, time: meeting.time.replace(/\s/g, '') }))
        /**
         * ignore TBA meetings
         */
        .filter((meeting) => meeting.time !== 'TBA')

        /**
         * map each meeting to an array of calendar events
         */
        .map((meeting) => {
          const { startHr, startMin, endHr, endMin } = meetingTimeToCalendarTimes(meeting.time);
          return (
            ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
              /**
               * ignore days that are not in the meeting days
               */
              .filter((day) => meeting.days.includes(day))

              /**
               * generate a calendar event for each meeting day
               */
              .map((_, index) => ({
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
              }))
          );
        })

        /**
         * an array of calendar events was generated for each meeting
         * flatten it into an array of calendar events of all meetings
         */
        .flat()
    )

    /**
     * an array of calendar events was generated for each course
     * flatten it into an array of calendar events of all courses
     */
    .flat();

/**
 * parses a final exam time into numerical components
 */
function finalsTimeToCalendarTime(finalExam: string) {
  const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = finalExam.match(
    /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
  );

  let startHour = parseInt(startStr, 10);
  const startMin = parseInt(startMinStr, 10);
  let endHour = parseInt(endStr, 10);
  const endMin = parseInt(endMinStr, 10);

  if (ampm === 'pm' && endHour !== 12) {
    startHour += 12;
    endHour += 12;
    if (startHour > endHour) startHour -= 12;
  }
  return {
    date,
    startHour,
    startMin,
    endHour,
    endMin,
  };
}

/**
 * returns finals as calendar events from courses
 */
export const calendarizeFinals = (currentCourses: Course[]) =>
  currentCourses
    .filter((course) => course.section.finalExam.length > 5)
    .map((course) => {
      const { date, startHour, startMin, endHour, endMin } = finalsTimeToCalendarTime(course.section.finalExam);
      return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        .filter((weekday) => date.includes(weekday))
        .map((_day, index) => ({
          title: course.deptCode + ' ' + course.courseNumber,
          sectionCode: course.section.sectionCode,
          sectionType: 'Fin',
          bldg: course.section.meetings[0].bldg,
          color: course.section.color,
          start: new Date(2018, 0, index - 1, startHour, startMin),
          end: new Date(2018, 0, index - 1, endHour, endMin),
          finalExam: course.section.finalExam,
          instructors: course.section.instructors,
          term: course.term,
          isCustomEvent: false,
        }))
        .flat();
    })
    .flat();

/**
 * returns custom events as calendar events from custom events
 */
export const calendarizeCustomEvents = (currentCustomEvents: RepeatingCustomEvent[]) =>
  currentCustomEvents
    .map((customEvent) =>
      customEvent.days
        .map((_day, dayIndex) => {
          const startHour = parseInt(customEvent.start.slice(0, 2), 10);
          const startMin = parseInt(customEvent.start.slice(3, 5), 10);
          const endHour = parseInt(customEvent.end.slice(0, 2), 10);
          const endMin = parseInt(customEvent.end.slice(3, 5), 10);

          return {
            customEventID: customEvent.customEventID,
            color: customEvent.color,
            start: new Date(2018, 0, dayIndex, startHour, startMin),
            isCustomEvent: true,
            end: new Date(2018, 0, dayIndex, endHour, endMin),
            title: customEvent.title,
          };
        })
        .flat()
    )
    .flat();

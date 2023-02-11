/**
 * helpers to convert courses or events to calendar events
 * TIP: hover over variables within map functions to see their types
 */

import type { Course, RepeatingCustomEvent } from '.';

/**
 * returns course meeting days as calendar events from courses
 */
export function calendarizeCourseEvents(currentCourses: Course[]) {
  const calendarEventsForAllCourses = currentCourses.map((course) => {
    const calendarEventsForCourse = course.section.meetings
      .map((meeting) => ({ ...meeting, time: meeting.time.replace(/\s/g, '') }))
      .filter((meeting) => meeting.time !== 'TBA')
      .map((meeting) => {
        const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = meeting.time.match(
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

        const calendarEventsMeeting = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
          .filter((day) => meeting.days.includes(day))
          .map((_, index) => {
            const newCalendarEvent = {
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
            };
            return newCalendarEvent;
          });
        return calendarEventsMeeting;
      });
    const flatCalendarEventsForCourse = calendarEventsForCourse.flat();
    return flatCalendarEventsForCourse;
  });
  const flatCalendarEventsForAllCourses = calendarEventsForAllCourses.flat();
  return flatCalendarEventsForAllCourses;
}

/**
 * returns finals as calendar events from courses
 */
export function calendarizeFinals(currentCourses: Course[]) {
  const finalsForAllCourses = currentCourses
    .filter((course) => course.section.finalExam.length > 5)
    .map((course) => {
      const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = course.section.finalExam.match(
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

      const finalsForCourse = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        .filter((weekday) => date.includes(weekday))
        .map((_day, index) => {
          const newCalendarEvent = {
            title: `${course.deptCode} ${course.courseNumber}`,
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
          };
          return newCalendarEvent;
        });
      return finalsForCourse;
    });
  const flatFinalsForAllCourses = finalsForAllCourses.flat();
  return flatFinalsForAllCourses;
}

/**
 * returns custom events as calendar events from custom events
 */
export function calendarizeCustomEvents(currentCustomEvents: RepeatingCustomEvent[]) {
  const calendarEventsForAllCustom = currentCustomEvents.map((customEvent) => {
    const calendarEventsForCustom = customEvent.days.map((_day, dayIndex) => {
      const startHour = parseInt(customEvent.start.slice(0, 2), 10);
      const startMin = parseInt(customEvent.start.slice(3, 5), 10);
      const endHour = parseInt(customEvent.end.slice(0, 2), 10);
      const endMin = parseInt(customEvent.end.slice(3, 5), 10);

      const newCalendarEvent = {
        customEventID: customEvent.customEventID,
        color: customEvent.color,
        start: new Date(2018, 0, dayIndex, startHour, startMin),
        isCustomEvent: true,
        end: new Date(2018, 0, dayIndex, endHour, endMin),
        title: customEvent.title,
      };
      return newCalendarEvent;
    });
    return calendarEventsForCustom;
  });
  const flatCalendarEventsForAllCustom = calendarEventsForAllCustom.flat();
  return flatCalendarEventsForAllCustom;
}

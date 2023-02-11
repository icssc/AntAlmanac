import { Course, RepeatingCustomEvent } from '.';

/**
 * array of day abbreviations
 */
const days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

/**
 * array of weekday abbreviations
 */
const weekdays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/**
 * returns course meeting days as calendar events from courses
 */
export function calendarizeCourseEvents(currentCourses: Course[]) {
  return currentCourses
    .map((course) =>
      course.section.meetings
        .filter((meeting) => meeting.time.replace(/\s/g, '') !== 'TBA')
        .map((meeting) => {
          const timeString = meeting.time.replace(/\s/g, '');
          const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString.match(
            /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
          );

          let startHr = parseInt(startHrStr, 10);
          const startMin = parseInt(startMinStr, 10);
          let endHr = parseInt(endHrStr, 10);
          const endMin = parseInt(endMinStr, 10);

          /**
           * map each day to a boolean indicating whether the course meets on that day
           */
          const dates = days.map((day) => meeting.days.includes(day));

          if (ampm === 'p' && endHr !== 12) {
            startHr += 12;
            endHr += 12;
            if (startHr > endHr) startHr -= 12;
          }

          return dates
            .filter((shouldBeInCal) => shouldBeInCal)
            .map((_date, index) => {
              const newEvent = {
                color: course.section.color,
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
              };
              return newEvent;
            });
        })
        .flat()
    )
    .flat();
}

/**
 * returns finals as calendar events from courses
 */
export function calendarizeFinals(currentCourses: Course[]) {
  return currentCourses
    .filter((course) => course.section.finalExam.length > 5)
    .map((course) => {
      const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = course.section.finalExam.match(
        /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
      );

      let startHour = parseInt(startStr, 10);
      const startMin = parseInt(startMinStr, 10);
      let endHour = parseInt(endStr, 10);
      const endMin = parseInt(endMinStr, 10);
      const weekdayInclusion = weekdays.map((weekday) => date.includes(weekday));

      if (ampm === 'pm' && endHour !== 12) {
        startHour += 12;
        endHour += 12;
        if (startHour > endHour) startHour -= 12;
      }

      return weekdayInclusion
        .filter((shouldBeInCal) => shouldBeInCal)
        .map((_day, index) => {
          return {
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
          };
        })
        .flat();
    })
    .flat();
}

/**
 * returns custom events as calendar events from custom events
 */
export function calendarizeCustomEvents(currentCustomEvents: RepeatingCustomEvent[]) {
  return currentCustomEvents.map((customEvent) => {
    return customEvent.days
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
      .flat();
  });
}

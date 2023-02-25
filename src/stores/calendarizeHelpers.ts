import { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

import { ScheduleCourse } from './schedule.types';

export const calendarizeCourseEvents = (currentCourses: ScheduleCourse[] = []) => {
    const courseEventsInCalendar: CourseEvent[] = [];

    for (const course of currentCourses) {
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

                        courseEventsInCalendar.push(newEvent);
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
                        color: course.section.color,
                        start: new Date(2018, 0, index - 1, startHour, startMin),
                        end: new Date(2018, 0, index - 1, endHour, endMin),
                        finalExam: course.section.finalExam,
                        instructors: course.section.instructors,
                        term: course.term,
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

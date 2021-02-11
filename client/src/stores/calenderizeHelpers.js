import AppStore from './AppStore';

export const calendarizeCourseEvents = () => {
    const addedCourses = AppStore.getAddedCourses();
    const courseEventsInCalendar = [];

    for (const course of addedCourses) {
        for (const meeting of course.section.meetings) {
            const timeString = meeting.time.replace(/\s/g, '');

            if (timeString !== 'TBA') {
                let [, startHr, startMin, endHr, endMin, ampm] = timeString.match(
                    /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
                );

                startHr = parseInt(startHr, 10);
                startMin = parseInt(startMin, 10);
                endHr = parseInt(endHr, 10);
                endMin = parseInt(endMin, 10);

                let dates = [
                    meeting.days.includes('M'),
                    meeting.days.includes('Tu'),
                    meeting.days.includes('W'),
                    meeting.days.includes('Th'),
                    meeting.days.includes('F'),
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
                            start: new Date(2018, 0, index + 1, startHr, startMin),
                            finalExam: course.section.finalExam,
                            end: new Date(2018, 0, index + 1, endHr, endMin),
                            isCustomEvent: false,
                            scheduleIndices: course.scheduleIndices,
                        };

                        courseEventsInCalendar.push(newEvent);
                    }
                });
            }
        }
    }

    return courseEventsInCalendar;
};

export const calendarizeFinals = () => {
    const addedCourses = AppStore.getAddedCourses();
    let finalsEventsInCalendar = [];

    for (const course of addedCourses) {
        const finalExam = course.section.finalExam;
        if (finalExam.length > 5) {
            let [, date, , , start, startMin, end, endMin, ampm] = finalExam.match(
                /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
            );
            start = parseInt(start, 10);
            startMin = parseInt(startMin, 10);
            end = parseInt(end, 10);
            endMin = parseInt(endMin, 10);
            date = [
                date.includes('Mon'),
                date.includes('Tue'),
                date.includes('Wed'),
                date.includes('Thu'),
                date.includes('Fri'),
            ];
            if (ampm === 'pm' && end !== 12) {
                start += 12;
                end += 12;
                if (start > end) start -= 12;
            }

            date.forEach((shouldBeInCal, index) => {
                if (shouldBeInCal)
                    finalsEventsInCalendar.push({
                        title: course.deptCode + ' ' + course.courseNumber,
                        sectionCode: course.section.sectionCode,
                        sectionType: 'Fin',
                        bldg: course.section.meetings[0].bldg,
                        color: course.color,
                        scheduleIndices: course.scheduleIndices,
                        start: new Date(2018, 0, index + 1, start, startMin),
                        end: new Date(2018, 0, index + 1, end, endMin),
                    });
            });
        }
    }

    return finalsEventsInCalendar;
};

export const calendarizeCustomEvents = () => {
    const customEvents = AppStore.getCustomEvents();
    const customEventsInCalendar = [];

    for (const customEvent of customEvents) {
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
            if (customEvent.days[dayIndex] === true) {
                const startHour = parseInt(customEvent.start.slice(0, 2), 10);
                const startMin = parseInt(customEvent.start.slice(3, 5), 10);
                const endHour = parseInt(customEvent.end.slice(0, 2), 10);
                const endMin = parseInt(customEvent.end.slice(3, 5), 10);

                customEventsInCalendar.push({
                    customEventID: customEvent.customEventID,
                    color: customEvent.color,
                    start: new Date(2018, 0, dayIndex + 1, startHour, startMin),
                    isCustomEvent: true,
                    end: new Date(2018, 0, dayIndex + 1, endHour, endMin),
                    scheduleIndices: customEvent.scheduleIndices,
                    title: customEvent.title,
                });
            }
        }
    }

    return customEventsInCalendar;
};

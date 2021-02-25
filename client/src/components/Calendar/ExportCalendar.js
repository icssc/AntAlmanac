import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import { Tooltip } from '@material-ui/core';
import Today from '@material-ui/icons/Today';
import { saveAs } from 'file-saver';
import { createEvents } from 'ics';
import AppStore from '../../stores/AppStore';

// Hardcoded first mondays
// Note(chase): doesn't account for week 0 in fall quarters
const quarterStartDates = {
    '2021 Spring': [2021, 3, 29],
};

const daysOfWeek = ['M', 'Tu', 'W', 'Th', 'F'];
const daysOfWeekIcs = ['MO', 'TU', 'WE', 'TH', 'FR'];
const translateDaysForIcs = { M: 'MO', Tu: 'TU', W: 'WE', Th: 'TH', F: 'FR' };

// getByDays returns the days that a class occurs
//  Given a string of days, convert it to a list of days in ics format
//  Ex: ("TuThF") -> ["TU", "TH", "FR"]
const getByDays = (days) => {
    return daysOfWeek.filter((day) => days.includes(day)).map((day) => translateDaysForIcs[day]);
};

// getClassStartDate returns the start date of a class
//  Given the term and the first day of the week that a class occurs,
//  this computes the start date of the class
//
//  Ex: ("2021 Spring", 'Tu') -> [2021, 3, 30]
//
// TODO: handle week 0 in fall quarters
const getClassStartDate = (term, firstClassDay) => {
    // Get the start date of the quarter (Monday)
    const quarterStartDate = new Date(quarterStartDates[term]);

    // dayOffset represents the number of days since the start of the quarter
    const dayOffset = daysOfWeekIcs.indexOf(firstClassDay);

    // Add the dayOffset to the quarterStartDate
    // Date object will handle potential overflow into the next month
    quarterStartDate.setDate(quarterStartDate.getDate() + dayOffset);

    // Return [Year, Month, Date]
    // Note: we add 1 to month since it is 0-indexed
    return [quarterStartDate.getFullYear(), quarterStartDate.getMonth() + 1, quarterStartDate.getDate()];
};

// getFirstClass returns the start and end datetime of the first class
//  Ex: ([2021, 3, 30], " 4:00-4:50p") -> [[2021, 3, 30, 16, 0], [2021, 3, 30, 16, 50]]
const getFirstClass = (date, time) => {
    const [classStartTime, classEndTime] = parseTimes(time);
    return [
        [...date, ...classStartTime],
        [...date, ...classEndTime],
    ];
};

// parseTimes converts a time string to a
//  This is a helper function used by getFirstClass
//  Ex: " 4:00-4:50p" -> [[16, 0], [16, 50]]
const parseTimes = (time) => {
    const [start, end] = time
        .substring(0, time.length - 1) // Ex: " 4:00-4:50"
        .split('-') // Ex: [" 4:00", "4:50"]
        .map(
            (timeString) =>
                timeString
                    .split(':') // Ex: [[" 4", "00"], ["4", "50"]]
                    .map((val) => parseInt(val)) // Ex: [[4, 0], [4, 50]]
        );

    // Add 12 hours if the time is pm
    if (time[time.length - 1] == 'p') {
        start[0] += 12;
        end[0] += 12;
    }

    return [start, end];
};

// getRRule returns a string representing the recurring rule for the VEvent
//  Ex: ["TU", "TH"] -> "FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=1;COUNT=20"
const getRRule = (bydays) => {
    const count = 10 * bydays.length; // Number of occurances in the quarter
    return `FREQ=WEEKLY;BYDAY=${bydays};INTERVAL=1;COUNT=${count}`;
};

class ExportCalendarButton extends PureComponent {
    handleClick = () => {
        // Fetch courses for the current schedule
        const courses = AppStore.getAddedCourses().filter((course) => {
            return course.scheduleIndices.includes(AppStore.getCurrentScheduleIndex());
        });

        // Construct an array of VEvents for each event
        var events = [];
        for (const course of courses) {
            const {
                term,
                deptCode,
                courseNumber,
                courseTitle,
                section: { sectionType, instructors, meetings },
            } = course;

            // Create a VEvent for each meeting
            for (const meeting of meetings) {
                const bydays = getByDays(meeting.days);
                const classStartDate = getClassStartDate(term, bydays[0]);
                const [firstClassStart, firstClassEnd] = getFirstClass(classStartDate, meeting.time);
                const rrule = getRRule(bydays);

                // Add VEvent to events array
                events.push({
                    productId: 'antalmanac/ics',
                    title: `${deptCode} ${courseNumber} ${sectionType}`,
                    description: `${courseTitle}\nTaught by ${instructors.join('/')}`,
                    location: `${meeting.bldg}`,
                    start: firstClassStart,
                    end: firstClassEnd,
                    recurrenceRule: rrule,
                });
            }
        }

        // Convert the events into a vcalendar
        // Callback function triggers a download of the .ics file
        createEvents(events, (err, val) => {
            if (!err) {
                console.log(val);
                // Download the .ics file
                var blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
                saveAs(blob, 'schedule.ics');
            } else {
                console.log(err);
            }
        });
    };

    render() {
        return (
            <Tooltip title="Download Calendar as an .ics file">
                <Button
                    onClick={this.handleClick}
                    variant="outlined"
                    size="small"
                    startIcon={<Today fontSize="small" />}
                >
                    Download
                </Button>
            </Tooltip>
        );
    }
}

export default ExportCalendarButton;

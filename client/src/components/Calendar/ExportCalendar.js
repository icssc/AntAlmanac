import React, { PureComponent } from 'react';
import ReactGA from 'react-ga';
import Button from '@material-ui/core/Button';
import { Tooltip } from '@material-ui/core';
import Today from '@material-ui/icons/Today';
import { saveAs } from 'file-saver';
import { createEvents } from 'ics';
import AppStore from '../../stores/AppStore';

// Hardcoded first mondays
// Note: months are 0-indexed
// TODO(chase): support summer sessions
const quarterStartDates = {
    '2019 Fall': [2019, 8, 26],
    '2020 Winter': [2020, 0, 6],
    '2020 Spring': [2020, 2, 30],
    '2020 Fall': [2020, 9, 1],
    '2021 Winter': [2021, 0, 4],
    '2021 Spring': [2021, 2, 29],
    '2021 Fall': [2021, 8, 23],
    '2022 Winter': [2022, 0, 3],
};

const daysOfWeek = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
const daysOffset = { SU: -1, MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5 };
const fallDaysOffset = { TH: 0, FR: 1, SA: 2, SU: 3, MO: 4, TU: 5, WE: 6 };
const translateDaysForIcs = { Su: 'SU', M: 'MO', Tu: 'TU', W: 'WE', Th: 'TH', F: 'FR', Sa: 'SA' };

// getByDays returns the days that a class occurs
//  Given a string of days, convert it to a list of days in ics format
//  Ex: ("TuThF") -> ["TU", "TH", "FR"]
const getByDays = (days) => {
    return daysOfWeek.filter((day) => days.includes(day)).map((day) => translateDaysForIcs[day]);
};

// getClassStartDate returns the start date of a class
//  Given the term and bydays, this computes the start date of the class
//
//  Ex: ("2021 Spring", 'Tu') -> [2021, 3, 30]
const getClassStartDate = (term, bydays) => {
    // Get the start date of the quarter (Monday)
    const quarterStartDate = new Date(...quarterStartDates[term]);

    // dayOffset represents the number of days since the start of the quarter
    var dayOffset;
    if (getQuarter(term) === 'Fall') {
        // Since Fall quarter starts on a Thursday the first byday and offset
        // will be different from other quarters
        bydays.sort((day1, day2) => {
            // Sorts bydays to match this ordering: [TH, FR, SA, SU, MO, TU, WE]
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
};

// dateToIcs takes a Date object and returns it in ics format [YYYY, MM, DD]
const dateToIcs = (date) => {
    return [
        date.getFullYear(),
        date.getMonth() + 1, // Add 1 month since it is 0-indexed
        date.getDate(),
    ];
};

// toUTC converts a list of times to UTC
//  offsetHours is the time difference to UTC
//
// Note(chase): We currently don't use this function because timezones are too annoying.
//  If you want to use this function, you also need to set the VEvent's
//  startInputType/endInputType to 'utc'
// eslint-disable-next-line
const toUTC = (times, offsetHours) => {
    return times.map((time) => {
        // Construct a Date object
        // Subtract the month by one, since it should be 0-indexed
        const dateTime = new Date(time[0], time[1] - 1, time[2], time[3], time[4]);

        // Add the offsetHours to the Date object
        dateTime.setHours(dateTime.getHours() + offsetHours);

        // Return formatted for ics
        return [...dateToIcs(dateTime), dateTime.getHours(), dateTime.getMinutes()];
    });
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

// getExamTime returns the start and end datetime of an exam
//  Ex: ("Mon Jun 7 10:30-12:30pm", "2019") -> [[2019, 6, 7, 10, 30], [2019, 6, 7, 12, 30]]
const months = { Mar: 3, Apr: 4, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Nov: 11, Dec: 12 };
const getExamTime = (exam, year) => {
    const [, month, day, time] = exam.split(' ');
    const [examStartTime, examEndTime] = parseTimes(time);

    return [
        [year, months[month], day, ...examStartTime],
        [year, months[month], day, ...examEndTime],
    ];
};

// parseTimes converts a time string to a
//  This is a helper function used by getFirstClass
//  Ex: " 4:00-4:50p" -> [[16, 0], [16, 50]]
const parseTimes = (time) => {
    // Determine whether the time is in the afternoon (PM)
    var pm = false;
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
                    .map((val) => parseInt(val)) // Ex: [[4, 0], [4, 50]]
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

    return [start, end];
};

// getYear returns the year of a given term
//  Ex: "2019 Fall" -> "2019"
const getYear = (term) => {
    return term.split(' ')[0];
};

// getQuarter returns the quarter of a given term
//  Ex: "2019 Fall" -> "Fall"
const getQuarter = (term) => {
    return term.split(' ')[1];
};

// getRRule returns a string representing the recurring rule for the VEvent
//  Ex: ["TU", "TH"] -> "FREQ=WEEKLY;BYDAY=TU,TH;INTERVAL=1;COUNT=20"
const getRRule = (bydays, quarter) => {
    var count = 10 * bydays.length; // Number of occurances in the quarter

    if (quarter === 'Fall') {
        for (const byday of bydays) {
            switch (byday) {
                case 'TH':
                case 'FR':
                case 'SA':
                    count += 1;
                    break;
                default:
                    break;
            }
        }
    }

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
                    startOutputType: 'local',
                    endOutputType: 'local',
                    title: `${deptCode} ${courseNumber} ${sectionType}`,
                    description: `${courseTitle}\nTaught by ${instructors.join('/')}`,
                    location: `${meeting.bldg}`,
                    start: firstClassStart,
                    end: firstClassEnd,
                    recurrenceRule: rrule,
                });
            }

            // Add Final to events
            if (finalExam && finalExam !== 'TBA') {
                const [examStart, examEnd] = getExamTime(finalExam, getYear(term));
                events.push({
                    productId: 'antalmanac/ics',
                    startOutputType: 'local',
                    endOutputType: 'local',
                    title: `${deptCode} ${courseNumber} Final Exam`,
                    description: `Final Exam for ${courseTitle}`,
                    start: examStart,
                    end: examEnd,
                });
            }
        }

        // Convert the events into a vcalendar
        // Callback function triggers a download of the .ics file
        createEvents(events, (err, val) => {
            if (!err) {
                // Download the .ics file
                var blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
                saveAs(blob, 'schedule.ics');
            } else {
                console.log(err);
            }
        });

        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Download .ics file',
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

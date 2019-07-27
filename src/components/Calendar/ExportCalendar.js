import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Today from '@material-ui/icons/Today';
import { ics } from './ics';

const daysOfWeek = ['M', 'Tu', 'W', 'Th', 'F'];
const translateDaysForIcs = {
  M: 'MO',
  Tu: 'TU',
  W: 'WE',
  Th: 'TH',
  F: 'FR',
};
const translateNumForIcs = {
  0: 'SU',
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
};

// hardcoded in relevant first mondays, note: doesn't account for week 0 in fall quarters
// used to get first monday depending on quarter
const quartersFirstMondays = {
  '2019 Spring': 'April 1, 2019',
  '2019 Fall': 'September 30, 2019',
};

function ExportButton(props) {
  const { eventsInCalendar, closeMenu } = props;
  // by default, set firstMonday to first Monday 2019 Fall (can be changed later on to different default)
  // this is to account for in case a user tries to download a schedule with no courses in them (just custom events)
  let firstMonday = new Date(quartersFirstMondays['2019 Fall']);

  // meetings is a string ex: "TuTh" or "MWF"
  // used for class/course events (NOT custom ones.. that is below)
  // returns days in an array with the proper format ex: ["TU", "TH"]
  function getCourseEventDays(meetings) {
    let meet = meetings.split(' ')[0];
    let days = [];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (meet.includes(daysOfWeek[i])) {
        days.push(translateDaysForIcs[daysOfWeek[i]]);
      }
    }
    return days;
  }

  // given a custom event ID,
  // get days that custom event occurs in a week so can add to calendar as one event
  // return days in array with the proper format ["MO", "WE", "FR"]
  function getCustomEventDays(customEventID) {
    let days = [];
    for (let i = 0; i < eventsInCalendar.length; i++) {
      if (
        eventsInCalendar[i].isCustomEvent &&
        eventsInCalendar[i].customEventID === customEventID
      ) {
        days.push(translateNumForIcs[eventsInCalendar[i].start.getDay()]);
      }
    }
    return days;
  }

  // calculate start and stop times in the format of Date objects given an event (course or custom)
  // returned as an array [start_time, stop_time]
  function getStartStopTimes(event) {
    let times = [];

    let start_time = new Date(firstMonday);
    start_time.setDate(start_time.getDate() + event.start.getDay() - 1); // based on first monday, figure out which day the class starts
    let end_time = new Date(start_time);

    start_time.setHours(event.start.getHours());
    start_time.setMinutes(event.start.getMinutes());
    end_time.setHours(event.end.getHours());
    end_time.setMinutes(event.end.getMinutes());

    times.push(start_time);
    times.push(end_time);
    return times;
  }

  // Used for debugging purposes, print the information of an event to make debugging easier in the future
  function logEventInfo(event) {
    console.log('Title: ' + event.title);
    console.log('IsCustomEvent: ' + event.isCustomEvent);
    if (!event.isCustomEvent) {
      console.log('Course Term: ' + event.courseTerm);
      console.log('Course Code: ' + event.courseCode);
      console.log('Course Type: ' + event.courseType);
      console.log('Location: ' + event.location);
    } else {
      console.log('Custom Event Id: ' + event.customEventID);
    }
  }

  return (
    <Fragment>
      <Button
        style={{ width: '100%', 'padding-right': '11px' }}
        onClick={() => {
          let added = []; // keep track of events already added in ics file to avoid duplicate events
          let cal = ics(); // initialize ics file

          // adding courses
          for (let i = 0; i < eventsInCalendar.length; i++) {
            // loop over all events in calendar
            let event = eventsInCalendar[i];
            try {
              if (!event.isCustomEvent) {
                // skip online courses
                if (event.location === 'ON LINE') {
                  continue;
                }

                // for courses
                firstMonday = new Date(quartersFirstMondays[event.courseTerm]); // set first Monday based off quarter

                if (added.indexOf(event.courseCode) === -1) {
                  let title = event.courseType + ' ' + event.title;
                  let location = event.location;
                  let description =
                    event.name.join(' ') + ' Course Code: ' + event.courseCode;

                  let times = getStartStopTimes(event);
                  let start_time = times[0];
                  let end_time = times[1];

                  let days = getCourseEventDays(event.section.meetings[0][0]); // pass in days class occurs in a string ex: "TuTh", "MWF"
                  let rrule = {
                    freq: 'WEEKLY',
                    count: 10 * days.length, // 10 weeks in the quarter * number days it occurs in a week
                    byday: days, // days it occurs in an array ex: ["TU", "TH"]
                  };

                  // add course event to ics file
                  cal.addEvent(
                    title,
                    description,
                    location,
                    start_time,
                    end_time,
                    rrule
                  );

                  added.push(event.courseCode); // we added this course

                  // adding finals
                  // note: this would be easier if could get final information in a better way (like Date object), had to splice a string to get all data
                  if (
                    event.section.hasOwnProperty('finalExam') &&
                    event.section.finalExam !== '' &&
                    event.section.finalExam !== 'TBA'
                  ) {
                    let final_info = event.section.finalExam.split(' ');
                    let end_hour = final_info[3].split('-')[1]; // get time that final ends to calculate when final begins

                    let final_date =
                      final_info[0] +
                      ' ' +
                      final_info[1] +
                      ' ' +
                      firstMonday.getFullYear(); // get date of the day of the final
                    let final_end = new Date(
                      final_date +
                        ' ' +
                        end_hour.slice(0, -2) +
                        ' ' +
                        end_hour.slice(-2)
                    ); // strange formatting to make Date object work
                    let final_start = new Date(final_end);
                    final_start.setHours(final_start.getHours() - 2); // finals start two hours before they end

                    // add course final to ics file
                    cal.addEvent(
                      'Final: ' + event.title,
                      '',
                      '',
                      final_start,
                      final_end
                    );
                  }
                }
              }
              // adding custom events
              else if (added.indexOf(event.customEventID) === -1) {
                let title = event.title;

                let times = getStartStopTimes(event);
                let start_time = times[0];
                let end_time = times[1];

                let days = getCustomEventDays(event.customEventID); // pass in customEventID
                let rrule = {
                  freq: 'WEEKLY',
                  count: 10 * days.length, // 10 weeks in the quarter * number of days it occurs in a week
                  byday: days, // days it occurs in an array ex: ["MO", "WE", "FR"]
                };

                // add custom event to ics file, description and location are blank
                cal.addEvent(title, '', '', start_time, end_time, rrule);

                added.push(event.customEventID); // we added this custom event
              }
            } catch (error) {
              console.log(
                'Error: ' + error.message + '\nSkipping the follow event: '
              );
              logEventInfo(event);
            }
          }

          cal.download(); // download ics file
          closeMenu();
        }}
      >
        <Today style={{ 'margin-right': '5px' }} />
        .ics
      </Button>
    </Fragment>
  );
}

export default ExportButton;

/* global saveAs, Blob, BlobBuilder, console */
/* exported ics */

import 'file-saver';

export let ics = function(uidDomain, prodId) {
  if (
    navigator.userAgent.indexOf('MSIE') > -1 &&
    navigator.userAgent.indexOf('MSIE 10') === -1
  ) {
    console.log('Unsupported Browser');
    return;
  }

  if (typeof uidDomain === 'undefined') {
    uidDomain = 'default';
  }
  if (typeof prodId === 'undefined') {
    prodId = 'Calendar';
  }

  let SEPARATOR = navigator.appVersion.indexOf('Win') !== -1 ? '\r\n' : '\n';
  let calendarEvents = [];
  let calendarStart = [
    'BEGIN:VCALENDAR',
    'PRODID:' + prodId,
    'VERSION:2.0',
  ].join(SEPARATOR);
  let calendarEnd = SEPARATOR + 'END:VCALENDAR';
  let BYDAY_VALUES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  return {
    /**
     * Returns events array
     * @return {array} Events
     */
    events: function() {
      return calendarEvents;
    },

    /**
     * Returns calendar
     * @return {string} Calendar in iCalendar format
     */
    calendar: function() {
      return (
        calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd
      );
    },

    /**
     * Add event to the calendar
     * @param  {string} subject     Subject/Title of event
     * @param  {string} description Description of event
     * @param  {string} location    Location of event
     * @param  {string} begin       Beginning date of event
     * @param  {string} stop        Ending date of event
     * @param rrule
     */
    addEvent: function(subject, description, location, begin, stop, rrule) {
      // I'm not in the mood to make these optional... So they are all required
      if (
        typeof subject === 'undefined' ||
        typeof description === 'undefined' ||
        typeof location === 'undefined' ||
        typeof begin === 'undefined' ||
        typeof stop === 'undefined'
      ) {
        return false;
      }

      // validate rrule
      if (rrule) {
        if (!rrule.rrule) {
          if (
            rrule.freq !== 'YEARLY' &&
            rrule.freq !== 'MONTHLY' &&
            rrule.freq !== 'WEEKLY' &&
            rrule.freq !== 'DAILY'
          ) {
            throw new Error(
              "Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'"
            );
          }

          if (rrule.until) {
            if (isNaN(Date.parse(rrule.until))) {
              throw new Error(
                "Recurrence rrule 'until' must be a valid date string"
              );
            }
          }

          if (rrule.interval) {
            if (isNaN(parseInt(rrule.interval, 10))) {
              throw new Error("Recurrence rrule 'interval' must be an integer");
            }
          }

          if (rrule.count) {
            if (isNaN(parseInt(rrule.count, 10))) {
              throw new Error("Recurrence rrule 'count' must be an integer");
            }
          }

          if (typeof rrule.byday !== 'undefined') {
            if (
              Object.prototype.toString.call(rrule.byday) !== '[object Array]'
            ) {
              throw new Error("Recurrence rrule 'byday' must be an array");
            }

            if (rrule.byday.length > 7) {
              throw new Error(
                "Recurrence rrule 'byday' array must not be longer than the 7 days in a week"
              );
            }

            // Filter any possible repeats
            rrule.byday = rrule.byday.filter(function(elem, pos) {
              return rrule.byday.indexOf(elem) === pos;
            });

            for (let d in rrule.byday) {
              if (BYDAY_VALUES.indexOf(rrule.byday[d]) < 0) {
                throw new Error(
                  "Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'"
                );
              }
            }
          }
        }
      }

      let start_date = new Date(begin);
      let end_date = new Date(stop);
      let now_date = new Date();

      let start_year = ('0000' + start_date.getFullYear().toString()).slice(-4);
      let start_month = ('00' + (start_date.getMonth() + 1).toString()).slice(
        -2
      );
      let start_day = ('00' + start_date.getDate().toString()).slice(-2);
      let start_hours = ('00' + start_date.getHours().toString()).slice(-2);
      let start_minutes = ('00' + start_date.getMinutes().toString()).slice(-2);
      let start_seconds = ('00' + start_date.getSeconds().toString()).slice(-2);

      let end_year = ('0000' + end_date.getFullYear().toString()).slice(-4);
      let end_month = ('00' + (end_date.getMonth() + 1).toString()).slice(-2);
      let end_day = ('00' + end_date.getDate().toString()).slice(-2);
      let end_hours = ('00' + end_date.getHours().toString()).slice(-2);
      let end_minutes = ('00' + end_date.getMinutes().toString()).slice(-2);
      let end_seconds = ('00' + end_date.getSeconds().toString()).slice(-2);

      let now_year = ('0000' + now_date.getFullYear().toString()).slice(-4);
      let now_month = ('00' + (now_date.getMonth() + 1).toString()).slice(-2);
      let now_day = ('00' + now_date.getDate().toString()).slice(-2);
      let now_hours = ('00' + now_date.getHours().toString()).slice(-2);
      let now_minutes = ('00' + now_date.getMinutes().toString()).slice(-2);
      let now_seconds = ('00' + now_date.getSeconds().toString()).slice(-2);

      // Since some calendars don't add 0 second events, we need to remove time if there is none...
      let start_time = '';
      let end_time = '';
      if (
        start_hours +
          start_minutes +
          start_seconds +
          end_hours +
          end_minutes +
          end_seconds !==
        0
      ) {
        start_time = 'T' + start_hours + start_minutes + start_seconds;
        end_time = 'T' + end_hours + end_minutes + end_seconds;
      }
      let now_time = 'T' + now_hours + now_minutes + now_seconds;

      let start = start_year + start_month + start_day + start_time;
      let end = end_year + end_month + end_day + end_time;
      let now = now_year + now_month + now_day + now_time;

      // recurrence rrule lets
      let rruleString;
      if (rrule) {
        if (rrule.rrule) {
          rruleString = rrule.rrule;
        } else {
          rruleString = 'RRULE:FREQ=' + rrule.freq;

          if (rrule.until) {
            let uDate = new Date(Date.parse(rrule.until)).toISOString();
            rruleString +=
              ';UNTIL=' +
              uDate.substring(0, uDate.length - 13).replace(/[-]/g, '') +
              '000000Z';
          }

          if (rrule.interval) {
            rruleString += ';INTERVAL=' + rrule.interval;
          }

          if (rrule.count) {
            rruleString += ';COUNT=' + rrule.count;
          }

          if (rrule.byday && rrule.byday.length > 0) {
            rruleString += ';BYDAY=' + rrule.byday.join(',');
          }
        }
      }

      let calendarEvent = [
        'BEGIN:VEVENT',
        'UID:' + calendarEvents.length + '@' + uidDomain,
        'CLASS:PUBLIC',
        'DESCRIPTION:' + description,
        'DTSTAMP;VALUE=DATE-TIME:' + now,
        'DTSTART;VALUE=DATE-TIME:' + start,
        'DTEND;VALUE=DATE-TIME:' + end,
        'LOCATION:' + location,
        'SUMMARY;LANGUAGE=en-us:' + subject,
        'TRANSP:TRANSPARENT',
        'END:VEVENT',
      ];

      if (rruleString) {
        calendarEvent.splice(4, 0, rruleString);
      }

      calendarEvent = calendarEvent.join(SEPARATOR);

      calendarEvents.push(calendarEvent);
      return calendarEvent;
    },

    /**
     * Download calendar using the saveAs function from filesave.js
     * @param  {string} filename Filename
     * @param  {string} ext      Extention
     */
    download: function(filename, ext) {
      if (calendarEvents.length < 1) {
        return false;
      }

      ext = typeof ext !== 'undefined' ? ext : '.ics';
      filename = typeof filename !== 'undefined' ? filename : 'calendar';
      let calendar =
        calendarStart +
        SEPARATOR +
        calendarEvents.join(SEPARATOR) +
        calendarEnd;

      let blob;
      if (navigator.userAgent.indexOf('MSIE 10') === -1) {
        // chrome or firefox
        blob = new Blob([calendar]);
      } else {
        // ie
        let bb = new BlobBuilder();
        bb.append(calendar);
        blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
      }
      saveAs(blob, filename + ext);
      return calendar;
    },

    /**
     * Build and return the ical contents
     */
    build: function() {
      if (calendarEvents.length < 1) {
        return false;
      }

      return (
        calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd
      ); // return calendar
    },
  };
};

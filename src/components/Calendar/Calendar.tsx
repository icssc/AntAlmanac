import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar';
import type { EventProps } from 'react-big-calendar';
import { Box, ClickAwayListener, Popper, Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';
import { calendarizeCustomEvents, calendarizeCourseEvents } from '$stores/schedule/calendarize';
import CalendarToolbar from './CalendarToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import CustomCalendarEvent from './CustomCalendarEvent';

type CalendarCourseEvent = ReturnType<typeof calendarizeCourseEvents>[number];
type CalendarCustomEvent = ReturnType<typeof calendarizeCustomEvents>[number];
type CalendarEvent = CalendarCourseEvent | CalendarCustomEvent;

/**
 * equation taken from w3c, omits the colour difference part
 * @see @link{https://www.w3.org/TR/WCAG20/#relativeluminancedef}
 */
function colorContrastSufficient(bg: string) {
  const minBrightnessDiff = 125;
  const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bg);
  if (!backgroundRegexResult) {
    return true;
  }
  const backgroundRGB = {
    r: parseInt(backgroundRegexResult[1], 16),
    g: parseInt(backgroundRegexResult[2], 16),
    b: parseInt(backgroundRegexResult[3], 16),
  };
  const textRgb = { r: 255, g: 255, b: 255 }; // white text
  const getBrightness = (color: typeof backgroundRGB) => {
    return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
  };
  const bgBrightness = getBrightness(backgroundRGB);
  const textBrightness = getBrightness(textRgb);
  return Math.abs(bgBrightness - textBrightness) > minBrightnessDiff;
}

/**
 * single calendar event box
 */
function AntAlmanacEvent(props: EventProps & { event: CalendarEvent }) {
  if (!props.event.isCustomEvent && 'bldg' in props.event)
    return (
      <Box>
        <Box>
          <Typography>{props.event.title}</Typography>
          <Typography>{props.event.sectionType}</Typography>
        </Box>
        <Box>
          <Typography>{props.event.bldg}</Typography>
          <Typography>{props.event.sectionCode}</Typography>
        </Box>
      </Box>
    );
  else {
    return (
      <Box>
        <Typography>{props.event.title}</Typography>
      </Box>
    );
  }
}

/**
 * entire calendar
 */
export default function AntAlamancCalendar() {
  const { currentSchedule } = useScheduleStore();
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [courseInMoreInfo, setCourseInMoreInfo] = useState<CalendarEvent | null>(null);
  const [calendarEventKey, setCalendarEventKey] = useState(0);

  const schedule = currentSchedule();
  const events = calendarizeCustomEvents(schedule.customEvents);
  const hasWeekendCourse = events.some((event) => event?.start.getDay() === 0 || event?.start.getDay() === 6);

  const isCourseEvent = courseInMoreInfo && 'bldg' in courseInMoreInfo;
  const isCustomEvent = courseInMoreInfo && 'customEventID' in courseInMoreInfo;

  function handleEventClick(calendarEvent: CalendarEvent, e: React.SyntheticEvent<HTMLElement, Event>) {
    e.stopPropagation();
    if (calendarEvent.isCustomEvent || ('sectionType' in calendarEvent && calendarEvent.sectionType !== 'Fin')) {
      setAnchorEl(e.currentTarget);
      setCourseInMoreInfo(calendarEvent);
      setCalendarEventKey((c) => c + 1);
    }
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <Box>
      <CalendarToolbar imgRef={ref} />
      <Box ref={ref}>
        <Calendar
          localizer={dayjsLocalizer(dayjs)}
          toolbar={false}
          formats={{
            timeGutterFormat(date: Date, culture?: string, localizer?: DateLocalizer) {
              return date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, 'h A', culture);
            },
            dayFormat: 'ddd',
          }}
          defaultView={Views.WORK_WEEK}
          views={[Views.WEEK, Views.WORK_WEEK]}
          onView={() => {}}
          view={hasWeekendCourse ? Views.WEEK : Views.WORK_WEEK}
          step={15}
          timeslots={2}
          defaultDate={new Date(2018, 0, 1)}
          min={new Date(2018, 0, 1, 7)}
          max={new Date(2018, 0, 1, 23)}
          events={events}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              cursor: 'pointer',
              borderStyle: 'none',
              borderRadius: '4px',
              color: colorContrastSufficient(event.color || '') ? 'white' : 'black',
            },
          })}
          showMultiDayTimes={false}
          components={{ event: AntAlmanacEvent }}
          onSelectEvent={handleEventClick}
        />
      </Box>

      <Popper anchorEl={anchorEl} placement="right" open={!!anchorEl}>
        <ClickAwayListener onClickAway={handleClose}>
          <Box>
            {isCourseEvent && (
              <CourseCalendarEvent key={calendarEventKey} event={courseInMoreInfo} closePopover={handleClose} />
            )}
            {isCustomEvent && (
              <CustomCalendarEvent key={calendarEventKey} event={courseInMoreInfo} closePopover={handleClose} />
            )}
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}

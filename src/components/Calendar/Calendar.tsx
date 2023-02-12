import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar';
import { Box, ClickAwayListener, Popper, Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';
import { calendarizeCustomEvents, calendarizeCourseEvents } from '$stores/schedule/calendarize';
import Toolbar from './Toolbar';

type CalendarCourseEvent = ReturnType<typeof calendarizeCourseEvents>[number];
type CalendarCustomEvent = ReturnType<typeof calendarizeCustomEvents>[number];
type CalendarEvent = CalendarCourseEvent | CalendarCustomEvent;

const localizer = dayjsLocalizer(dayjs);

const formats = {
  timeGutterFormat(date: Date, culture?: string, localizer?: DateLocalizer) {
    return date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, 'h A', culture);
  },
  dayFormat: 'ddd',
};

function eventPropGetter(event: CalendarEvent) {
  return {
    style: {
      backgroundColor: event.color,
      cursor: 'pointer',
      borderStyle: 'none',
      borderRadius: '4px',
      color: colorContrastSufficient(event.color || '') ? 'white' : 'black',
    },
  };
}

function noop() {}

function AntAlmanacEvent(props: { event: CalendarEvent }) {
  const event = props.event;
  if (!event.isCustomEvent)
    return (
      <Box>
        <Box>
          <Typography>{event.title}</Typography>
          <Typography>{'sectionType' in event && event.sectionType}</Typography>
        </Box>
        <Box>
          <Typography>{'bldg' in event && event.bldg}</Typography>
          <Typography>{'sectionCode' in event && event.sectionCode}</Typography>
        </Box>
      </Box>
    );
  else {
    return (
      <Box>
        <Typography>{event.title}</Typography>
      </Box>
    );
  }
}

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

export default function AntAlamancCalendar() {
  const { schedules } = useScheduleStore();
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [courseInMoreInfo, setCourseInMoreInfo] = useState<CalendarEvent | null>(null);
  const [calendarEventKey, setCalendarEventKey] = useState(0);

  const events = calendarizeCustomEvents(schedules[0].customEvents);
  const hasWeekendCourse = events.some((event) => event?.start.getDay() === 0 || event?.start.getDay() === 6);
  const scheduleNames = schedules.map((s) => s.scheduleName);

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
      <Toolbar imgRef={ref} />
      <Box ref={ref}>
        <Calendar
          localizer={localizer}
          toolbar={false}
          formats={formats}
          defaultView={Views.WORK_WEEK}
          views={[Views.WEEK, Views.WORK_WEEK]}
          onView={noop}
          view={hasWeekendCourse ? Views.WEEK : Views.WORK_WEEK}
          step={15}
          timeslots={2}
          defaultDate={new Date(2018, 0, 1)}
          min={new Date(2018, 0, 1, 7)}
          max={new Date(2018, 0, 1, 23)}
          events={events}
          eventPropGetter={eventPropGetter}
          showMultiDayTimes={false}
          components={{ event: AntAlmanacEvent }}
          onSelectEvent={handleEventClick}
        />
        <Popper anchorEl={anchorEl} placement="right" open={!!anchorEl}>
          <ClickAwayListener onClickAway={handleClose}>
            <Box>Hehe</Box>
          </ClickAwayListener>
          {/*
          <CourseCalendarEvent
            key={this.state.calendarEventKey}
            closePopover={this.handleClosePopover}
            courseInMoreInfo={this.state.courseInMoreInfo as CalendarEvent}
            scheduleNames={this.state.scheduleNames}
          />
            */}
        </Popper>
      </Box>
    </Box>
  );
}

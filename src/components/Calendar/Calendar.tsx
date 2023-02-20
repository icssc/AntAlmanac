import dayjs from 'dayjs'
import { useState, useRef } from 'react'
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar'
import type { EventProps } from 'react-big-calendar'
import { Box, ClickAwayListener, Paper, Popper, useTheme } from '@mui/material'
import { useScheduleStore } from '$stores/schedule'
import { useSettingsStore } from '$stores/settings'
import { getCourseCalendarEvents, getFinalsCalendarEvents, getCustomCalendarEvents } from '$stores/schedule/calendar'
import type { CalendarEvent } from '$stores/schedule/calendar'
import CalendarToolbar from './Toolbar'
import CourseEventDetails from './Details/CourseEvent'
import CustomEventDetails from './Details/CustomEvent'

/**
 * single calendar event box
 */
function AntAlmanacEvent(props: EventProps & { event: CalendarEvent }) {
  if (!props.event.isCustomEvent && 'bldg' in props.event)
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.8rem', fontWeight: 690 }}>{props.event.title}</Box>
          <Box sx={{ fontSize: '0.8rem' }}>{props.event.sectionType}</Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.8rem' }}>{props.event.bldg}</Box>
          <Box sx={{ fontSize: '0.8rem' }}>{props.event.sectionCode}</Box>
        </Box>
      </Box>
    )
  else {
    return (
      <Box sx={{ my: 2, fontSize: '0.85rem', fontWeight: 690 }}>
        <Box>{props.event.title}</Box>
      </Box>
    )
  }
}

/**
 * entire calendar
 */
export default function AntAlamancCalendar() {
  const { showFinals } = useSettingsStore()
  const { schedules, scheduleIndex } = useScheduleStore()
  const theme = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const [courseInMoreInfo, setCourseInMoreInfo] = useState<CalendarEvent>()
  const [calendarEventKey, setCalendarEventKey] = useState(0)

  const currentSchedule = schedules[scheduleIndex]

  const courses = currentSchedule?.courses
  const customEvents = currentSchedule?.customEvents

  /**
   * if showing finals, get the finals calendar events;
   * otherwise join the two arrays of course and custom calendar events
   */
  const events = showFinals
    ? getFinalsCalendarEvents(courses)
    : [...getCourseCalendarEvents(courses), ...getCustomCalendarEvents(customEvents)]

  const hasWeekendCourse = events.some((event) => event?.start.getDay() === 0 || event?.start.getDay() === 6)

  const isCourseEvent = courseInMoreInfo && 'bldg' in courseInMoreInfo
  const isCustomEvent = courseInMoreInfo && 'customEventID' in courseInMoreInfo

  function handleEventClick(calendarEvent: CalendarEvent, e: React.SyntheticEvent<HTMLElement, Event>) {
    e.stopPropagation()
    if (calendarEvent.isCustomEvent || ('sectionType' in calendarEvent && calendarEvent.sectionType !== 'Fin')) {
      setAnchorEl(e.currentTarget)
      setCourseInMoreInfo(calendarEvent)
      setCalendarEventKey((c) => c + 1)
    }
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  return (
    <Box>
      <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <CalendarToolbar imgRef={ref} />
      </Paper>
      <Box ref={ref}>
        <Calendar
          localizer={dayjsLocalizer(dayjs)}
          toolbar={false}
          formats={{
            timeGutterFormat(date: Date, culture?: string, localizer?: DateLocalizer) {
              return date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, 'h A', culture)
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
              color: theme.palette.getContrastText(event.color),
            },
          })}
          showMultiDayTimes={false}
          components={{ event: AntAlmanacEvent }}
          onSelectEvent={handleEventClick}
        />
      </Box>

      <Popper anchorEl={anchorEl} placement="right" open={!!anchorEl} sx={{ zIndex: 1 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Box>
            {isCourseEvent && (
              <CourseEventDetails key={calendarEventKey} event={courseInMoreInfo} closePopover={handleClose} />
            )}
            {isCustomEvent && (
              <CustomEventDetails key={calendarEventKey} event={courseInMoreInfo} closePopover={handleClose} />
            )}
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}

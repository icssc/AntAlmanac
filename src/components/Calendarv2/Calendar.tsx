import dayjs from 'dayjs'
import { useState, useRef } from 'react'
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar'
import type { EventProps } from 'react-big-calendar'
import { Box, ClickAwayListener, Popper } from '@mui/material'
import { useScheduleStore } from '$stores/schedule'
import { useSettingsStore } from '$stores/settings'
import { getCourseCalendarEvents, getFinalsCalendarEvents, getCustomCalendarEvents } from '$stores/schedule/calendar'
import type { CalendarEvent } from '$stores/schedule/calendar'
import CalendarToolbar from './CalendarToolbar'
import CourseEventDetails from './EventDetails/CourseEvent'
import CustomEventDetails from './EventDetails/CustomEvent'


interface rgbColor {
  r: number
  g: number
  b: number
}

function getBrightness(color: rgbColor) {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000
}

/**
 * equation taken from w3c, omits the colour difference part
 * @see @link{https://www.w3.org/TR/WCAG20/#relativeluminancedef}
 */
function isContrastSufficient(color: string) {
  const minBrightnessDiff = 125

  const backgroundRegexResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)

  if (!backgroundRegexResult) {
    return true
  }

  const backgroundRGB = {
    r: parseInt(backgroundRegexResult[1], 16),
    g: parseInt(backgroundRegexResult[2], 16),
    b: parseInt(backgroundRegexResult[3], 16),
  }
  const textRgb = { r: 255, g: 255, b: 255 } // white text

  const bgBrightness = getBrightness(backgroundRGB)
  const textBrightness = getBrightness(textRgb)

  return Math.abs(bgBrightness - textBrightness) > minBrightnessDiff
}

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
      <CalendarToolbar imgRef={ref} />
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
              color: isContrastSufficient(event.color || '') ? 'white' : 'black',
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

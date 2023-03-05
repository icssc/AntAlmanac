import 'react-big-calendar/lib/css/react-big-calendar.css'
import './Calendar.css'

import dayjs from 'dayjs'
import { useEffect, useState, useRef } from 'react'
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar'
import type { EventProps } from 'react-big-calendar'
import { Box, ClickAwayListener, Paper, Popper, useTheme, Typography } from '@mui/material'
import { useScheduleStore } from '$stores/schedule'
import useSettingsStore from '$stores/settings'
import { getCourseCalendarEvents, getFinalsCalendarEvents, getCustomCalendarEvents } from '$stores/schedule/calendar'
import type { CalendarEvent } from '$stores/schedule/calendar'
import trpc from '$lib/trpc'
import CourseEventDetails from './Details/CourseEvent'
import CustomEventDetails from './Details/CustomEvent'

/**
 * single calendar event box
 */
function AntAlmanacEvent({ ...props }: EventProps & { event: CalendarEvent }) {
  if (!props.event.isCustomEvent && 'bldg' in props.event)
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{props.event.title}</Box>
          <Box sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{props.event.sectionType}</Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.7rem' }}>{props.event.bldg}</Typography>
          <Typography sx={{ fontSize: '0.7rem' }}>{props.event.sectionCode}</Typography>
        </Box>
      </Box>
    )
  return (
    <Box sx={{ my: 2, fontSize: '0.85rem', fontWeight: 690 }}>
      <Box>{props.event.title}</Box>
    </Box>
  )
}

/**
 * entire calendar
 */
export default function AntAlamancCalendar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const [info, setInfo] = useState<CalendarEvent>()
  const theme = useTheme()
  const showFinals = useSettingsStore((store) => store.showFinals)
  const courses = useScheduleStore((store) => store.schedules[store.scheduleIndex].courses)
  const customEvents = useScheduleStore((store) => store.schedules[store.scheduleIndex].customEvents)

  /**
   * this ref is important! pass it to the screenshot button to take a picture of the calendar
   */
  const ref = useRef<HTMLDivElement>(null)

  /**
   * if showing finals, get the finals calendar events;
   * otherwise join the two arrays of course and custom calendar events
   */
  const events = showFinals
    ? getFinalsCalendarEvents(courses)
    : [...getCourseCalendarEvents(courses), ...getCustomCalendarEvents(customEvents)]

  const hasWeekendCourse = events.some((event) => event?.start.getDay() === 0 || event?.start.getDay() === 6)

  const handleSelectEvent = (calendarEvent: CalendarEvent, e: React.SyntheticEvent<HTMLElement, Event>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setInfo(calendarEvent)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const utils = trpc.useContext()

  useEffect(() => {
    utils.schedule.find.fetch('rem').then(res => {
      useScheduleStore.setState(res)
    })
  }, [])

  return (
    <Box>
      <Paper sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
        {/*
        <CalendarToolbar imgRef={ref} />
          */}
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
          min={new Date(2018, 0, 1, 6)}
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
          onSelectEvent={handleSelectEvent}
        />
      </Box>

      {/* additional info about event in a popper when event is clicked */}
      <Popper anchorEl={anchorEl} placement="right" open={!!anchorEl} sx={{ zIndex: 1 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Box>
            {info && 'bldg' in info && <CourseEventDetails event={info} closePopover={handleClose} />}
            {info && 'customEventID' in info && <CustomEventDetails event={info} closePopover={handleClose} />}
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  )
}

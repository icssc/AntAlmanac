import { useMemo, useState } from 'react'
import { Box, Button, ClickAwayListener, Popper } from '@mui/material'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import trpc from '$lib/trpc'
import { useScheduleStore } from '$stores/schedule'
import { getCourseCalendarEvents } from '$stores/schedule/calendar'
import type { CalendarEvent } from '$stores/schedule/calendar'

/**
 * single calendar event box
 */
function AntAlmanacEvent(eventContentProps: EventContentArg) {
  const props = eventContentProps.event._def.extendedProps
  const eventProps = eventContentProps.event
  if (!props.isCustomEvent && 'bldg' in props)
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.8rem', fontWeight: 690 }}>{eventProps.title}</Box>
          <Box sx={{ fontSize: '0.8rem' }}>{props.sectionType}</Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.8rem' }}>{props.bldg}</Box>
          <Box sx={{ fontSize: '0.8rem' }}>{props.sectionCode}</Box>
        </Box>
      </Box>
    )
  else {
    return (
      <Box sx={{ my: 2, fontSize: '0.85rem', fontWeight: 690 }}>
        <Box>{eventProps.title}</Box>
      </Box>
    )
  }
}

export default function Calendar() {
  const [info, setInfo] = useState<CalendarEvent>()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const courses = useScheduleStore((store) => store.schedules[store.scheduleIndex].courses)
  const events = useMemo(() => getCourseCalendarEvents(courses), [courses])
  const utils = trpc.useContext()

  const handleClick = async () => {
    const res = await utils.schedule.find.fetch('rem')
    useScheduleStore.setState(res)
  }

  const handleEventClick = (event: EventClickArg) => {
    event.jsEvent.stopPropagation()
    setAnchorEl(event.el)
    const newInfo: any = {
      title: event.event.title,
      ...event.event.extendedProps
    }
    setInfo(newInfo)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  return (
    <Box>
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        headerToolbar={false}
        dayHeaderFormat={{
          weekday: 'short',
        }}
        height="calc(100vh - 100px)"
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        initialDate={new Date(2018, 0, 1)}
        events={events}
        eventContent={AntAlmanacEvent}
        eventClick={handleEventClick}
      />
      <Popper anchorEl={anchorEl} open={!!anchorEl} sx={{ zIndex: 1 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Box whiteSpace="pre">
           {info && 'bldg' in info && (
             JSON.stringify(info, null, 2)
              // <CourseEventDetails key={calendarEventKey} event={courseInMoreInfo} closePopover={handleClose} />
            )}
          </Box>
        </ClickAwayListener>
      </Popper>
      <Button onClick={handleClick} variant="contained">
        Load
      </Button>
    </Box>
  )
}

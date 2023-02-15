import { useRef } from 'react'
import { createEvents } from 'ics'
import { useSnackbar } from 'notistack'
import { Button, Link, Tooltip } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '$stores/schedule'
import { getEventsFromCourses, vTimeZoneSection } from '$lib/download'

/**
 * you can give it any component that accepts an onClick prop;
 * any additional props are forwarded to this component
 */
interface Props extends Record<string, any> {
  component?: React.ComponentType
  children?: React.ReactNode
}

/**
 * button that downloads the current schedule as an .ics file
 */
export default function DownloadButton(props: Props) {
  const { schedules, scheduleIndex } = useScheduleStore()
  const { enqueueSnackbar } = useSnackbar()
  const ref = useRef<HTMLAnchorElement>(null)

  const { component, children, ...$$restProps } = props
  const ComponentToUse = component ?? Button

  function exportCalendar() {
    const events = getEventsFromCourses(schedules[scheduleIndex].courses)

    createEvents(events, (err, val) => {
      logAnalytics({
        category: 'Calendar Pane',
        action: analyticsEnum.calendar.actions.DOWNLOAD,
      })

      if (err || !ref.current) {
        enqueueSnackbar('Something went wrong! Unable to download schedule.', { variant: 'error' })
        console.log(err)
        return
      }

      // Add timezone information to start and end times for events
      const icsString = val
        .replaceAll('DTSTART', 'DTSTART;TZID=America/Los_Angeles')
        .replaceAll('DTEND', 'DTEND;TZID=America/Los_Angeles')

      // inject the VTIMEZONE section into the .ics file
      const blob = new Blob([icsString.replace('BEGIN:VEVENT', vTimeZoneSection)], {
        type: 'text/plain;charset=utf-8',
      })

      ref.current.href = URL.createObjectURL(blob)
      ref.current.download = 'schedule.ics'
      ref.current.click()

      enqueueSnackbar('Schedule downloaded!', { variant: 'success' })
    })
  }

  return (
    <>
      <Tooltip title="Download Calendar as an .ics file">
        <ComponentToUse onClick={exportCalendar} {...$$restProps}>
          {children || 'Download'}
        </ComponentToUse>
      </Tooltip>
      <Link ref={ref} sx={{ display: 'none' }} />
    </>
  )
}

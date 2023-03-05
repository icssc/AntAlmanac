import { useRef } from 'react'
import { createEvents } from 'ics'
import { useSnackbar } from 'notistack'
import { IconButton, Link, Tooltip } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'
import { getEventsFromCourses, vTimeZoneSection } from '$lib/download'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '$stores/schedule'

export default function DownloadButton() {
  const courses = useScheduleStore((store) => store.schedules[store.scheduleIndex].courses)
  const { enqueueSnackbar } = useSnackbar()
  const ref = useRef<HTMLAnchorElement>(null)

  const exportCalendar = () => {
    const events = getEventsFromCourses(courses)

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
      <Tooltip title="Download Schedule (.ics)">
        <IconButton onClick={exportCalendar}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Link ref={ref} sx={{ display: 'none' }} href="/">
        Invisible link to download files
      </Link>
    </>
  )
}

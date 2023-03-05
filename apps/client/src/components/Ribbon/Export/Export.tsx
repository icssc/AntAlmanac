import { useRef, useState } from 'react'
import { createEvents } from 'ics'
import html2canvas from 'html2canvas'
import { useSnackbar } from 'notistack'
import { Link, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material'
import { Download as DownloadIcon, Panorama as PanoramaIcon, Share as ShareIcon } from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '$stores/schedule'
import { getEventsFromCourses, vTimeZoneSection } from '$lib/download'

interface Props {
  /**
   * React ref of the element to screenshot
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function ExportMenu({ imgRef }: Props) {
  const theme = useTheme()
  const { schedules, scheduleIndex } = useScheduleStore()
  const { enqueueSnackbar } = useSnackbar()
  const ref = useRef<HTMLAnchorElement>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleClose = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  const exportCalendar = () => {
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

  async function handleScreenshot() {
    if (!imgRef.current || !ref.current) {
      return
    }

    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.SCREENSHOT,
    })

    const canvas = await html2canvas(imgRef.current, {
      scale: 2.5,
      backgroundColor: theme.palette.background.paper,
    })

    ref.current.href = canvas.toDataURL('image/png')
    ref.current.download = 'Schedule.png'
    ref.current.click()
  }

  function handleShare() {
    window.alert('Work in Progress')
  }

  return (
    <>
      <MenuItem onClick={handleClick} disableRipple>
        <ListItemText>Export</ListItemText>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} transitionDuration={0}>
          <MenuItem onClick={exportCalendar} dense>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download (.ics)</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleScreenshot} dense>
            <ListItemIcon>
              <PanoramaIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Screenshot</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleShare} dense>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        </Menu>
      </MenuItem>
      <Link ref={ref} sx={{ display: 'none' }}>
        Invisible link to download files
      </Link>
    </>
  )
}

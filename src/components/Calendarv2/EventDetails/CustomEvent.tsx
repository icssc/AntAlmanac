import { Delete as DeleteIcon } from '@mui/icons-material'
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import analyticsEnum, { logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '$stores/schedule'
import { deleteCustomEvent } from '$stores/schedule/custom'
import type { CustomCalendarEvent } from '$stores/schedule/calendar'
import CustomEventButton from '$components/Buttons/CustomEvent'
import ColorPicker from '$components/Buttons/ColorPicker'

interface CourseCalendarEventProps {
  event: CustomCalendarEvent
  closePopover: () => void
}

export default function CourseCalendarEvent(props: CourseCalendarEventProps) {
  const { schedules, scheduleIndex } = useScheduleStore()

  const schedule = schedules[scheduleIndex]
  const customEvent = schedule.customEvents.find((c) => c.customEventID === props.event.customEventID)

  function handleDelete() {
    props.closePopover()
    deleteCustomEvent(props.event.customEventID, [scheduleIndex])
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DELETE_CUSTOM_EVENT,
    })
    props.closePopover()
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography>{props.event.title}</Typography>
      <Box>
        <ColorPicker
          color={props.event.color || ''}
          isCustomEvent={true}
          customEventID={props.event.customEventID}
          analyticsCategory={analyticsEnum.calendar.title}
        />
        <CustomEventButton onDialogClose={props.closePopover} event={customEvent} />
        <Tooltip title="Delete">
          <IconButton onClick={handleDelete} size="large">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  )
}

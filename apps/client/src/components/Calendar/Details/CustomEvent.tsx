import { Delete as DeleteIcon } from '@mui/icons-material'
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '$stores/schedule'
import { deleteCustomEvent } from '$stores/schedule/custom'
import type { CustomCalendarEvent } from '$stores/schedule/calendar'
import CustomEventButton from '$components/buttons/CustomEvent'
import ColorPicker from '$components/buttons/ColorPicker'

interface Props {
  event: CustomCalendarEvent
  closePopover?: () => void
}

export default function CustomEventDetails({ event, closePopover }: Props) {
  const scheduleIndex = useScheduleStore((store) => store.scheduleIndex)
  const customEvent = useScheduleStore((store) =>
    store.schedules[store.scheduleIndex].customEvents.find((e) => e.customEventID === event.customEventID)
  )

  const handleDelete = () => {
    deleteCustomEvent(event.customEventID, [scheduleIndex])
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DELETE_CUSTOM_EVENT,
    })
    closePopover?.()
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography>{event.title}</Typography>
      <Box>
        <ColorPicker
          color={event.color || ''}
          isCustomEvent
          customEventID={event.customEventID}
          analyticsCategory={analyticsEnum.calendar.title}
        />
        <CustomEventButton onDialogClose={closePopover} event={customEvent} />
        <Tooltip title="Delete Custom Event">
          <IconButton onClick={handleDelete} size="large">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  )
}

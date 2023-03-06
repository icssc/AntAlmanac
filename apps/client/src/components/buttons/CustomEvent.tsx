import { useState, useEffect } from 'react'
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Input,
  InputLabel,
  TextField,
  Tooltip,
} from '@mui/material'
import type { RepeatingCustomEvent } from '@packages/types'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { addCustomEvent, editCustomEvent } from '$stores/schedule/custom'
import useSettingsStore from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'

const defaultCustomEvent: RepeatingCustomEvent = {
  start: '10:30',
  end: '15:30',
  title: '',
  days: [false, false, false, false, false, false, false],
  customEventID: 0,
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props {
  event?: RepeatingCustomEvent
  onDialogClose?: () => void

  /**
   * whether to only render an icon
   */
  iconOnly?: boolean
}

/**
 * button that opens up a dialog to add or edit a custom event
 */
export default function CustomEventButton({ event, onDialogClose, iconOnly }: Props) {
  const { schedules, scheduleIndex } = useScheduleStore()
  const { isDarkMode } = useSettingsStore()
  const [disabled, setDisabled] = useState('')
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<RepeatingCustomEvent>(event || structuredClone(defaultCustomEvent))
  const [selectedSchedules, setSelectedSchedules] = useState([scheduleIndex])

  useEffect(() => {
    if (!value.title) {
      setDisabled('Please enter a title')
    } else if (!value?.start) {
      setDisabled('Please enter a start time')
    } else if (!value?.end) {
      setDisabled('Please enter an end time')
    } else if (!value?.days.some(Boolean)) {
      setDisabled('Please select a day')
    } else if (!selectedSchedules.length) {
      setDisabled('Please select a schedule')
    } else {
      setDisabled('')
    }
  }, [value.title, value.start, value.end, value.days, selectedSchedules])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  /**
   * returns text input event handler to change start/end time
   */
  const handleTextTime =
    (key: keyof typeof value) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setValue({ ...value, [key]: e.target.value })
    }

  /**
   * returns checkbox event handler to change the occurrance days
   */
  const handleCheckDay = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue((prevEvent) => ({
      ...prevEvent,
      days: prevEvent.days.map((day, i) => (i === index ? e.target.checked : day)),
    }))
  }

  /**
   * returns checkbox event handler to change the schedule indices to add the event to
   */
  const handleCheckSchedule = (index: number) => () => {
    if (selectedSchedules.includes(index)) {
      setSelectedSchedules((current) => current.filter((schedule) => schedule !== index))
    } else {
      setSelectedSchedules((current) => [...current, index])
    }
  }

  const handleCancel = () => {
    setValue(event || structuredClone(defaultCustomEvent))
    setOpen(false)
    onDialogClose?.()
  }

  const handleSubmit = () => {
    if (!value.days.some((day) => day) || selectedSchedules.length === 0) {
      return
    }

    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
    })

    const array = new Uint32Array(1)

    const newCustomEvent = {
      color: event ? event.color : '#551a8b',
      ...value,
      customEventID: event ? event.customEventID : window.crypto.getRandomValues(array)[0] + Date.now(),
    }

    if (event) {
      editCustomEvent(newCustomEvent, selectedSchedules)
    } else {
      addCustomEvent(newCustomEvent, selectedSchedules)
    }

    setValue(event || structuredClone(defaultCustomEvent))
    setSelectedSchedules([scheduleIndex])
    setOpen(false)
  }

  const Icon = event ? EditIcon : AddIcon

  return (
    <>
      <Tooltip title={`${event ? 'Rename Custom Event' : 'Add Custom Event'}`}>
        {event || iconOnly ? (
          <IconButton onClick={handleOpen}>
            <Icon />
          </IconButton>
        ) : (
          <Button
            disableRipple
            onClick={handleOpen}
            variant="outlined"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
          >
            Add Custom
          </Button>
        )}
      </Tooltip>
      <Dialog open={open} maxWidth="lg" onClose={handleClose}>
        <DialogTitle>{event ? 'Edit' : 'Create'} Custom Event</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 4, my: 2 }}>
            <FormControl>
              <InputLabel>Event Name</InputLabel>
              <Input required value={value?.title} onChange={handleTextTime('title')} />
            </FormControl>

            <FormGroup row sx={{ gap: 4 }}>
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <TextField onChange={handleTextTime('start')} type="time" value={value.start} />
              </FormControl>
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <TextField onChange={handleTextTime('end')} type="time" value={value.end} />
              </FormControl>
            </FormGroup>

            <Divider />

            <FormLabel>Occurring Days</FormLabel>
            <FormGroup row>
              {days.map((day, index) => (
                <FormControlLabel
                  key={day}
                  control={<Checkbox checked={value.days[index]} onChange={handleCheckDay(index)} />}
                  label={day}
                />
              ))}
            </FormGroup>

            <Divider />

            <FormLabel>Schedules</FormLabel>
            <FormGroup>
              {schedules.map((schedule, index) => (
                <FormControlLabel
                  key={schedule.scheduleName}
                  control={
                    <Checkbox checked={selectedSchedules.includes(index)} onChange={handleCheckSchedule(index)} />
                  }
                  label={schedule.scheduleName}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color={isDarkMode ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!!disabled}>
            {disabled || (event ? 'Save Changes' : 'Add Event')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

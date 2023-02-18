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
import analyticsEnum, { logAnalytics } from '$lib/analytics'
import { addCustomEvent, editCustomEvent } from '$stores/schedule/custom'
import { useSettingsStore } from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import type { RepeatingCustomEvent } from '$stores/schedule'

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
}

/**
 * opens up dialog modal to add a new custom event or edit an existing custom event
 */
export default function CustomEvent(props: Props) {
  const { schedules, scheduleIndex } = useScheduleStore()
  const { isDarkMode } = useSettingsStore()
  const [disabled, setDisabled] = useState('')
  const [open, setOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<RepeatingCustomEvent>(props.event || structuredClone(defaultCustomEvent))
  const [selectedSchedules, setSelectedSchedules] = useState([scheduleIndex])

  /**
   * form validation runs whenever form values change
   */
  useEffect(() => {
    if (!currentEvent.title) {
      setDisabled('Please enter a title')
    } else if (!currentEvent?.start) {
      setDisabled('Please enter a start time')
    } else if (!currentEvent?.end) {
      setDisabled('Please enter an end time')
    } else if (!currentEvent?.days.some(Boolean)) {
      setDisabled('Please select a day')
    } else if (!selectedSchedules.length) {
      setDisabled('Please select a schedule')
    } else {
      setDisabled('')
    }
  }, [currentEvent.title, currentEvent.start, currentEvent.end, currentEvent.days, selectedSchedules])

  function handleOpen() {
    setOpen(true)
  }

  function handleTextChange(key: keyof typeof currentEvent) {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCurrentEvent({ ...currentEvent, [key]: e.target.value })
    }
  }

  function handleDay(index: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentEvent((prevEvent) => ({
        ...prevEvent,
        days: prevEvent.days.map((day, i) => (i === index ? e.target.checked : day)),
      }))
    }
  }

  function handleSchedule(index: number) {
    return () => {
      if (selectedSchedules.includes(index)) {
        setSelectedSchedules((schedules) => schedules.filter((schedule) => schedule !== index))
      } else {
        setSelectedSchedules((schedules) => [...schedules, index])
      }
    }
  }

  function handleCancel() {
    setCurrentEvent(props.event || structuredClone(defaultCustomEvent))
    setOpen(false)
    props.onDialogClose?.()
  }

  function handleSubmit() {
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
    })

    const newCustomEvent = {
      color: props.event ? props.event.color : '#551a8b',
      ...currentEvent,
      customEventID: props.event ? props.event.customEventID : Date.now(),
    }

    if (props.event) {
      editCustomEvent(newCustomEvent, selectedSchedules)
    } else {
      addCustomEvent(newCustomEvent, selectedSchedules)
    }

    setCurrentEvent(props.event || structuredClone(defaultCustomEvent))
    setSelectedSchedules([scheduleIndex])
    setOpen(false)
  }

  return (
    <>
      <Tooltip title={`${props.event ? 'Rename Custom Event' : 'Add Custom Event'}`}>
        {props.event ? (
          <IconButton onClick={handleOpen}>
            <EditIcon />
          </IconButton>
        ) : (
          <Button 
            onClick={handleOpen}
            variant="outlined" 
            size="small" 
            startIcon={<AddIcon fontSize="small" />}
          >
          Add Custom
          </Button>
        )}
      </Tooltip>
      <Dialog open={open} maxWidth={'lg'}>
        <DialogTitle>{props.event ? 'Edit' : 'Create'} Custom Event</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 4, my: 2 }}>
            <FormControl>
              <InputLabel>Event Name</InputLabel>
              <Input required={true} value={currentEvent?.title} onChange={handleTextChange('title')} />
            </FormControl>

            <FormGroup row sx={{ gap: 4 }}>
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <TextField onChange={handleTextChange('start')} type="time" value={currentEvent.start} />
              </FormControl>
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <TextField onChange={handleTextChange('end')} type="time" value={currentEvent.end} />
              </FormControl>
            </FormGroup>

            <Divider />

            <FormLabel>Occurring Days</FormLabel>
            <FormGroup row>
              {days.map((day, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox checked={currentEvent.days[index]} onChange={handleDay(index)} />}
                  label={day}
                />
              ))}
            </FormGroup>

            <Divider />

            <FormLabel>Schedules</FormLabel>
            <FormGroup>
              {schedules.map((schedule, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox checked={selectedSchedules.includes(index)} onChange={handleSchedule(index)} />}
                  label={schedule.scheduleName}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!!disabled}>
            {disabled ? disabled : props.event ? 'Save Changes' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { SelectChangeEvent } from '@mui/material'
import { useSettingsStore } from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import { setScheduleIndex, addSchedule } from '$stores/schedule/schedule'

/**
 * select form that can switch between schedules or add a new schedule
 */
export default function SelectScheduleButton() {
  const { isDarkMode } = useSettingsStore()
  const { schedules, scheduleIndex } = useScheduleStore()
  const [open, setOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState('')

  function handleOpen() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleSelectChange(e: SelectChangeEvent<string>) {
    const index = parseInt(e.target.value, 10)
    if (index < schedules.length) {
      setScheduleIndex(index)
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setScheduleName(e.target.value)
  }

  function handleAddSchedule() {
    addSchedule(scheduleName)
    setScheduleName('')
    handleClose()
  }

  return (
    <>
      <Select size="small" value={scheduleIndex.toString()} onChange={handleSelectChange} fullWidth>
        {schedules.map((schedule, index) => (
          <MenuItem key={index} value={index}>
            {schedule.scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleOpen} value={schedules.length}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>Add Schedule</ListItemText>
        </MenuItem>
      </Select>

      <Dialog open={open} fullWidth>
        <DialogTitle>Add Schedule</DialogTitle>
        <DialogContent>
          <FormGroup sx={{ my: 2 }}>
            <TextField label="Name" onChange={handleTextChange} value={scheduleName} fullWidth />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleAddSchedule} variant="contained" color="primary" disabled={!scheduleName}>
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { useState } from 'react'
import { Edit as EditIcon } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material'
import { useSettingsStore } from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import { renameCurrentSchedule } from '$stores/schedule/schedule'

export default function RenameScheduleButton() {
  const [open, setOpen] = useState(false)
  const { schedules, scheduleIndex } = useScheduleStore()
  const { isDarkMode } = useSettingsStore()
  const [scheduleName, setScheduleName] = useState(schedules[scheduleIndex]?.scheduleName || '')

  function handleOpen() {
    setOpen(true)
  }

  function handleRename() {
    renameCurrentSchedule(scheduleName)
    setOpen(false)
  }

  function handleClose() {
    setScheduleName('')
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setScheduleName(e.target.value)
  }

  return (
    <>
      <Tooltip title="Rename Schedule">
        <IconButton onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} fullWidth onClose={handleClose}>
        <DialogTitle>Rename Schedule</DialogTitle>
        <DialogContent>
          <FormGroup sx={{ marginY: 2 }}>
            <TextField label="Name" onChange={handleChange} value={scheduleName} fullWidth />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleRename} variant="contained" color="primary" disabled={!scheduleName}>
            Rename Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, TextField } from '@mui/material'
import useSettingsStore from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import { renameCurrentSchedule } from '$stores/schedule/schedule'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  index?: number
}

/**
 * dialog with a form to rename the current schedule
 */
export default function RenameScheduleDialog({ open, setOpen, index }: Props) {
  const isDarkMode = useSettingsStore((store) => store.isDarkMode)
  const originalName = useScheduleStore((store) => store.schedules[index ?? store.scheduleIndex]?.scheduleName)
  const [scheduleName, setScheduleName] = useState(originalName)
  const title = originalName ? 'Rename Schedule' : 'Add a New Schedule'
  const action = originalName ? 'Rename Schedule' : 'Add Schedule'

  const handleRename = () => {
    renameCurrentSchedule(scheduleName)
    setOpen(false)
  }

  const handleClose = () => {
    setScheduleName(originalName)
    setOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleName(e.target.value)
  }

  return (
    <Dialog open={open} fullWidth onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <FormGroup sx={{ marginY: 2 }}>
          <TextField label="Name" onChange={handleChange} value={scheduleName} fullWidth />
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color={isDarkMode ? 'inherit' : 'primary'}>
          Cancel
        </Button>
        <Button onClick={handleRename} variant="contained" color="primary" disabled={!scheduleName}>
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

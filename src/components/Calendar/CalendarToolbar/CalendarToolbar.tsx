import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  IconButton,
  TextField,
  Toolbar,
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import SelectScheduleButton from '$components/Buttons/SelectSchedule'
import ToggleFinalsButton from '$components/Buttons/ToggleFinals'
import MenuBar from '$components/MenuBar'
import { useSettingsStore } from '$stores/settings'
import { useScheduleStore } from '$stores/schedule'
import { renameCurrentSchedule, deleteCurrentSchedule } from '$stores/schedule/schedule'

interface Props {
  /**
   * provide a React ref to the element to screenshot; this is prop-drilled down to the ScreenshotButton
   */
  imgRef: React.RefObject<HTMLElement>
}

export default function CalendarToolbar(props: Props) {
  const { schedules, scheduleIndex } = useScheduleStore()
  const { isDarkMode } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState(schedules[scheduleIndex]?.scheduleName || '')

  function handleRename() {
    renameCurrentSchedule(scheduleName)
    setOpen(false)
  }

  function handleDelete() {
    deleteCurrentSchedule()
  }

  function handleClose() {
    setScheduleName('')
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setScheduleName(e.target.value)
  }

  function handleOpen() {
    setOpen(true)
  }

  return (
    <AppBar position="static" color="transparent" sx={{ '&.MuiAppBar-root': { boxShadow: 'none' }, p: 1 }}>
      <MenuBar {...props} />
      <Toolbar sx={{ '&.MuiToolbar-root': { p: 0, minHeight: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 0.5 }}>
          <IconButton onClick={handleOpen}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
          <SelectScheduleButton />
          <ToggleFinalsButton />
        </Box>
      </Toolbar>

      <Dialog open={open} fullWidth>
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
    </AppBar>
  )
}

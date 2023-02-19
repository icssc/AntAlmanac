import { useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from '@mui/material'
import { useSettingsStore } from '$stores/settings'
import { loadSchedule } from '$stores/schedule/load'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * dialog to load a schedule
 */
export default function LoadDialog(props: Props) {
  const { open, setOpen } = props
  const [userId, setUserId] = useState('')
  const [remember, setRemember] = useState(false)
  const { isDarkMode } = useSettingsStore()

  async function handleSubmit() {
    await loadSchedule(userId, remember)
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setUserId(e.target.value)
  }

  function handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
    setRemember(e.target.checked)
  }

  return (
    <Dialog open={open || false}>
      <DialogTitle>Load Schedule</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter your username here to load your schedule.</DialogContentText>
        <TextField
          fullWidth
          onChange={handleChange}
          autoFocus
          margin="dense"
          label="User ID"
          type="text"
          placeholder="Enter here"
        />
        <FormControlLabel
          control={<Checkbox defaultChecked onChange={handleChecked} />}
          label="Remember Me (Uncheck on shared computers)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color={isDarkMode() ? 'inherit' : 'primary'}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

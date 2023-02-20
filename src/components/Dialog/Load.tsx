import { useState } from 'react'
import { useSnackbar } from 'notistack'
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
import { LoadingButton } from '@mui/lab'
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
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const { open, setOpen } = props
  const [userId, setUserId] = useState('')
  const [remember, setRemember] = useState(false)
  const { isDarkMode } = useSettingsStore()

  async function handleSubmit() {
    setLoading(true)
    await loadSchedule(userId, remember, {
      onSuccess() {
        enqueueSnackbar(`Schedule for user ${userId} loaded!`, { variant: 'success' })
      },
      onError(error) {
        enqueueSnackbar(error.message, { variant: 'error' })
      },
    })
    setLoading(false)
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
        <LoadingButton onClick={handleSubmit} variant="contained" color="primary" loading={loading}>
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

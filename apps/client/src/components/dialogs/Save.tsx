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
import useSettingsStore from '$stores/settings'
import { saveSchedule } from '$stores/schedule/save'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * dialog to save a schedule
 */
export default function SaveDialog({ open, setOpen }: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [remember, setRemember] = useState(false)
  const { isDarkMode } = useSettingsStore()

  const handleSubmit = async () => {
    setLoading(true)
    await saveSchedule(userId, remember, {
      onSuccess() {
        enqueueSnackbar(`Schedule saved under username ${userId}. Don't forget to sign up for classes on WebReg!`, {
          variant: 'success',
        })
      },
      onError() {
        enqueueSnackbar(`Schedule could not be saved under username "${userId}`, { variant: 'error' })
      },
    })
    setLoading(false)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setUserId(e.target.value)
  }

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(e.target.checked)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Save Schedule</DialogTitle>

      <DialogContent>
        <DialogContentText>Enter your username here to save your schedule.</DialogContentText>
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
        <Button onClick={handleCancel} color={isDarkMode ? 'inherit' : 'primary'}>
          Cancel
        </Button>
        <LoadingButton onClick={handleSubmit} variant="contained" color="primary" loading={loading}>
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

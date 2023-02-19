import { useState } from 'react'
import type { ComponentProps } from 'react'
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
import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material'
import { useSettingsStore } from '$stores/settings'
import { loadSchedule } from '$stores/schedule/load'

/**
 * default props for the component
 */
interface Props<T> {
  component?: T
  children?: React.ReactNode
}

type InferredProps<T> = 
  Props<T>['component'] extends React.ComponentType ? 
  Props<T> & React.ComponentPropsWithoutRef<Props<T>['component']> : Props<T>

/**
 * button that opens up a dialog to load a schedule
 */
export default function LoadScheduleButton<T>(props?: InferredProps<T>) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [remember, setRemember] = useState(false)
  const { isDarkMode } = useSettingsStore()

  const { component, ...$$restProps } = props || {}
  const Component = component as React.ComponentType<{ children?: React.ReactNode, onClick: () => void }> || Button

  async function handleSubmit() {
    await loadSchedule(userId, remember)
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
  }

  function handleClick() {
    setOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setUserId(e.target.value)
  }

  function handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
    setRemember(e.target.checked)
  }

  return (
    <>
      <Component onClick={handleClick} {...$$restProps}>
        Load
      </Component>
      <Dialog open={open}>
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
    </>
  )
}

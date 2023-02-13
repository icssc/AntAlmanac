import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, TextField } from '@mui/material';
import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { useSettingsStore } from '$stores/settings'
import { useLoadSchedule } from '$stores/schedule/load'

export default function LoadButton() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const loadSchedule = useLoadSchedule()
  const isDarkMode = useSettingsStore(store => store.isDarkMode)

  function handleSubmit() {
    loadSchedule(value)
  }

  function handleCancel() {
    setOpen(false)
  }

  function handleClick() {
    setOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setValue(e.target.value)
  }

  return (
    <>
    <Button color="inherit" startIcon={<CloudDownloadIcon />} onClick={handleClick}>
      Load
    </Button>
      <Dialog open={open}>
        <DialogTitle>Load Schedule</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>User ID</FormLabel>
            <TextField onChange={handleChange} />
          </FormControl>
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

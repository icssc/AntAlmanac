import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useState } from 'react';

import useLoadSchedule from '$hooks/schedule/useLoadSchedule';
import { useSettingsStore } from '$lib/stores/settings';

export default function LoadSaveButton() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [remember, setRemember] = useState(true);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const loadSchedule = useLoadSchedule();

  function handleToggle() {
    setRemember((prevRemember) => !prevRemember);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setUserId(e.target.value);
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleLoad() {
    loadSchedule(userId, remember);
    setOpen(false);
  }

  return (
    <>
      <Button onClick={handleOpen} color="inherit" startIcon={<CloudDownloadIcon />}>
        Load
      </Button>
      <Dialog open={open}>
        <DialogTitle>Load</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter your username here to load your schedule.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            type="text"
            fullWidth
            placeholder="Enter here"
            value={userId}
            onChange={handleChange}
          />
          <FormControlLabel
            control={<Checkbox checked={remember} onChange={handleToggle} color="primary" />}
            label="Remember Me (Uncheck on shared computers)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleLoad} color={isDarkMode() ? 'inherit' : 'primary'}>
            Load
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

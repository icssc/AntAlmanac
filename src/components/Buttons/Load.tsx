import { useState } from 'react';
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
} from '@mui/material';
import { CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { useSettingsStore } from '$stores/settings';
import { useLoadSchedule } from '$stores/schedule/load';

export default function LoadButton() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [remember, setRemember] = useState(false);
  const loadSchedule = useLoadSchedule();
  const isDarkMode = useSettingsStore((store) => store.isDarkMode);

  async function handleSubmit() {
    await loadSchedule(userId, remember);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleClick() {
    setOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setUserId(e.target.value);
  }

  function handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
    setRemember(e.target.checked);
  }

  return (
    <>
      <Button color="inherit" startIcon={<CloudDownloadIcon />} onClick={handleClick}>
        Load
      </Button>
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
  );
}

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
import { Save as SaveIcon } from '@mui/icons-material';
import { useSettingsStore } from '$stores/settings';
import { useSaveSchedule } from '$stores/schedule/save';

export default function SaveScheduleButton() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [remember, setRemember] = useState(false);
  const saveSchedule = useSaveSchedule();
  const isDarkMode = useSettingsStore((store) => store.isDarkMode);

  async function handleSubmit() {
    await saveSchedule(userId, remember);
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
      <Button color="inherit" startIcon={<SaveIcon />} onClick={handleClick}>
        Save
      </Button>
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

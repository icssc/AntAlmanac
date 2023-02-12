import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { useSettingsStore } from '$stores/settings';
import { useScheduleStore } from '$stores/schedule';
import { setScheduleIndex, addSchedule } from '$stores/schedule/schedule';

export default function SelectScheduleButton() {
  const { isDarkMode } = useSettingsStore();
  const { schedules, scheduleIndex } = useScheduleStore();
  const [open, setOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('');

  function handleSelect(e: SelectChangeEvent<string>) {
    setScheduleIndex(parseInt(e.target.value, 10));
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setScheduleName(e.target.value);
  }

  function handleAddSchedule() {
    addSchedule(scheduleName);
    setScheduleName('');
    handleClose();
  }

  return (
    <>
      <Select size="small" value={`${scheduleIndex}`} onChange={handleSelect}>
        {schedules.map((schedule, index) => (
          <MenuItem key={index} value={index}>
            {schedule.scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleOpen}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText>Add Schedule</ListItemText>
        </MenuItem>
      </Select>

      <Dialog open={open} fullWidth>
        <DialogTitle>Rename Schedule</DialogTitle>
        <DialogContent>
          <FormGroup sx={{ my: 2 }}>
            <TextField label="Name" onChange={handleChange} value={scheduleName} fullWidth />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color={isDarkMode() ? 'inherit' : 'primary'}>
            Cancel
          </Button>
          <Button onClick={handleAddSchedule} variant="contained" color="primary" disabled={!scheduleName}>
            Rename Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

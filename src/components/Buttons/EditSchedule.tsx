import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useSettingsStore } from '$stores/settings';
import { useScheduleStore } from '$stores/schedule';
import { deleteCurrentSchedule, renameCurrentSchedule } from '$stores/schedule/schedule';

export default function EditScheduleButton() {
  const { isDarkMode } = useSettingsStore();
  const { schedules, scheduleIndex } = useScheduleStore();

  const schedule = schedules[scheduleIndex];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [scheduleName, setScheduleName] = useState(schedule?.scheduleName || '');
  const [open, setOpen] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(e.currentTarget);
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setScheduleName('');
    setOpen(false);
    setAnchorEl(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setScheduleName(e.target.value);
  }

  function handleRename() {
    renameCurrentSchedule(scheduleName);
    handleClose();
  }

  function handleDelete() {
    deleteCurrentSchedule();
  }

  return (
    <>
      <Tooltip title="Edit schedule">
        <IconButton onClick={handleClick} color="inherit">
          <EditIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleOpen}>Rename schedule</MenuItem>
        <MenuItem onClick={handleDelete}>Delete schedule</MenuItem>
      </Menu>

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
          <Button onClick={handleRename} variant="contained" color="primary" disabled={!scheduleName}>
            Rename Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { AppBar, Button, Toolbar } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { useScheduleStore } from '$lib/stores/schedule';
import Import from './Import';
import Load from './Load';

export default function ActionsBar() {
  const customEvents = useScheduleStore((state) => state.customEvents);

  return (
    <AppBar position="static" sx={{ marginBottom: '4px' }}>
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <Button color="inherit" startIcon={<AssignmentIcon />}>
          Save
        </Button>
        <Load />
        <Import />
        {JSON.stringify(customEvents)}
      </Toolbar>
    </AppBar>
  );
}

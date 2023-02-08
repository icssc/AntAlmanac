import { AppBar, Button, Toolbar } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { useScheduleStore } from '$lib/stores/schedule'

export default function ActionsBar() {
  const customEvents = useScheduleStore(state => state.customEvents)

  return (
    <AppBar position="static" sx={{ marginBottom: '4px' }}>
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <Button color="inherit" startIcon={<AssignmentIcon />}>
          Save
        </Button>
        <Button color="inherit" startIcon={<AssignmentIcon />}>
          Load
        </Button>
        <Button color="inherit" startIcon={<AssignmentIcon />}>
          Import
        </Button>
        {JSON.stringify(customEvents)}
      </Toolbar>
    </AppBar>
  );
}

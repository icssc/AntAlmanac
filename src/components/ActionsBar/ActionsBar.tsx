import { AppBar, Button, Toolbar } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import LoadButton from '$components/Buttons/Load';
import SaveScheduleButton from '$components/Buttons/Save';

export default function ActionsBar() {
  return (
    <AppBar position="static">
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <SaveScheduleButton />
        <LoadButton />
        <Button color="inherit" startIcon={<AssignmentIcon />}>
          Import
        </Button>
      </Toolbar>
    </AppBar>
  );
}

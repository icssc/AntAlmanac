import { AppBar, Button, Toolbar } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

export default function ActionsBar() {
  return (
    <AppBar position="static">
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
      </Toolbar>
    </AppBar>
  );
}

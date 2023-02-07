import { Button, Tooltip } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

export default function FeedbackButton() {
  return (
    <Tooltip title="Give Us Feedback">
      <Button href="https://forms.gle/k81f2aNdpdQYeKK8A" target="_blank" color="inherit" startIcon={<AssignmentIcon />}>
        Feedback
      </Button>
    </Tooltip>
  );
}

import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { Download } from '@mui/icons-material';
import { exportCalendar } from '$lib/download';

const ExportCalendarButton = () => (
    <Tooltip title="Download Calendar as an .ics file">
        <Button onClick={exportCalendar} variant="outlined" size="small" startIcon={<Download fontSize="small" />}>
            Download
        </Button>
    </Tooltip>
);

export default ExportCalendarButton;

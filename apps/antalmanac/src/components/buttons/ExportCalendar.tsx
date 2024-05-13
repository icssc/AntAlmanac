import { Download } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { exportCalendar } from '$lib/download';

const ExportCalendarButton = () => (
    <Tooltip title="Download Calendar as a .ics file. You can import this file to Google or Apple calendars.">
        <IconButton onClick={exportCalendar} size="medium">
            <Download fontSize="small" />
        </IconButton>
    </Tooltip>
);

export default ExportCalendarButton;

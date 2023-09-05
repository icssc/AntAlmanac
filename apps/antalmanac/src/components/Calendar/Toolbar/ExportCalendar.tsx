import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Today from '@material-ui/icons/Today';
import { exportCalendar } from '$lib/download';

const ExportCalendarButton = () => (
    <Tooltip title="Download Calendar as an .ics file">
        <Button onClick={exportCalendar} variant="outlined" size="small" startIcon={<Today fontSize="small" />}>
            Download
        </Button>
    </Tooltip>
);

export default ExportCalendarButton;

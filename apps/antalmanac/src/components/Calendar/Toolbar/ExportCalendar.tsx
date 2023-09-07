import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';

const ExportCalendarButton = () => (
    <Tooltip title="Download Calendar as an .ics file">
        <Button onClick={exportCalendar} variant="outlined" size="small" startIcon={<Download fontSize="small" />}>
            Download
        </Button>
    </Tooltip>
);

export default ExportCalendarButton;

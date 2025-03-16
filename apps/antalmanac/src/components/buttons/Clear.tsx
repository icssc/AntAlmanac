import { DeleteOutline } from '@mui/icons-material';
import { IconButton, IconButtonProps, IconProps, Tooltip } from '@mui/material';

import { clearSchedules } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

function handleClearSchedule() {
    if (window.confirm('Are you sure you want to clear this schedule?')) {
        clearSchedules();
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CLEAR_SCHEDULE,
        });
    }
}

interface ClearScheduleButtonProps extends IconButtonProps {
    fontSize?: IconProps['fontSize'];
}

export function ClearScheduleButton({ disabled = false, sx, fontSize = 'small' }: ClearScheduleButtonProps) {
    return (
        <Tooltip title="Clear schedule">
            <IconButton sx={sx} onClick={handleClearSchedule} disabled={disabled}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}

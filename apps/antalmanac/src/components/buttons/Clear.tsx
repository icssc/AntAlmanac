import { DeleteOutline } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip } from '@mui/material';

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

interface ClearScheduleButtonProps {
    skeletonMode?: boolean;
    buttonSx?: SxProps;
    size?: 'small' | 'medium' | 'large' | undefined;
    fontSize?: 'small' | 'medium' | 'large' | 'inherit' | undefined;
}

export function ClearScheduleButton({ skeletonMode, buttonSx, size, fontSize }: ClearScheduleButtonProps) {
    return (
        <Tooltip title="Clear schedule">
            <IconButton sx={buttonSx} onClick={handleClearSchedule} size={size} disabled={skeletonMode}>
                <DeleteOutline fontSize={fontSize} />
            </IconButton>
        </Tooltip>
    );
}

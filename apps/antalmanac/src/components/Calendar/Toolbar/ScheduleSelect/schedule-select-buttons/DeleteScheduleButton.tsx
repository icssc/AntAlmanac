import { Clear as ClearIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import DeleteScheduleDialog from '$components/dialogs/DeleteSchedule';
import { useScheduleStore } from '$stores/ScheduleStore';

interface DeleteScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

export function DeleteScheduleButton({ index, disabled }: DeleteScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Tooltip title="Delete Schedule">
                <span>
                    <IconButton
                        onClick={handleOpen}
                        size="small"
                        disabled={useScheduleStore.getState().schedule.getNumberOfSchedules() === 1 || disabled}
                    >
                        <ClearIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <DeleteScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

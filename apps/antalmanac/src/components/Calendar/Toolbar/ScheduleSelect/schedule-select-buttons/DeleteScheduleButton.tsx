import { Clear as ClearIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import DeleteScheduleDialog from '$components/dialogs/DeleteSchedule';
import AppStore from '$stores/AppStore';

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
                        disabled={AppStore.schedule.getNumberOfSchedules() === 1 || disabled}
                    >
                        <ClearIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <DeleteScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

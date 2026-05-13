import DeleteScheduleDialog from '$components/dialogs/DeleteSchedule';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Clear as ClearIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

interface DeleteScheduleButtonProps {
    index: number;
}

export function DeleteScheduleButton({ index }: DeleteScheduleButtonProps) {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Delete Schedule" disableInteractive>
                <span>
                    <IconButton
                        onClick={handleOpen}
                        size="small"
                        disabled={AppStore.schedule.getNumberOfSchedules() === 1 || fallbackMode}
                    >
                        <ClearIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <DeleteScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </>
    );
}

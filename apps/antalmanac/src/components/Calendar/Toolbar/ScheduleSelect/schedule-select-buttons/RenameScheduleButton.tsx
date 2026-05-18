import RenameScheduleDialog from '$components/dialogs/RenameSchedule';
import { useFallbackStore } from '$stores/FallbackStore';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

interface RenameScheduleButtonProps {
    index: number;
}

export function RenameScheduleButton({ index }: RenameScheduleButtonProps) {
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
            <Tooltip title="Rename Schedule" disableInteractive>
                <span>
                    <IconButton onClick={handleOpen} size="small" disabled={fallbackMode}>
                        <EditIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <RenameScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </>
    );
}

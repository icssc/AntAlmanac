import CopyScheduleDialog from '$components/dialogs/CopySchedule';
import { useFallbackStore } from '$stores/FallbackStore';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, type SxProps, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

interface CopyScheduleButtonProps {
    index: number;
    buttonSx?: SxProps;
}

export function CopyScheduleButton({ index, buttonSx }: CopyScheduleButtonProps) {
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
            <Tooltip title="Copy Schedule" disableInteractive>
                <span>
                    <IconButton sx={buttonSx} onClick={handleOpen} size="small" disabled={fallbackMode}>
                        <ContentCopy />
                    </IconButton>
                </span>
            </Tooltip>
            <CopyScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </>
    );
}

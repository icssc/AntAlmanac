import { ContentCopy } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import CopyScheduleDialog from '$components/dialogs/CopySchedule';

interface CopyScheduleButtonProps {
    index: number;
    buttonSx?: SxProps;
}

export function CopyScheduleButton({ index, buttonSx }: CopyScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Copy Schedule">
                <IconButton sx={buttonSx} onClick={handleOpen} size="small">
                    <ContentCopy />
                </IconButton>
            </Tooltip>
            <CopyScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </>
    );
}

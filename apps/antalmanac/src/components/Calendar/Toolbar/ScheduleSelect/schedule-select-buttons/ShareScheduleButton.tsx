import { Share as ShareIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import ShareScheduleDialog from '$components/dialogs/ShareSchedule';

interface ShareScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

export function ShareScheduleButton({ index, disabled }: ShareScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Share Schedule" disableInteractive>
                <span>
                    <IconButton onClick={handleOpen} size="small" disabled={disabled}>
                        <ShareIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <ShareScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </>
    );
}

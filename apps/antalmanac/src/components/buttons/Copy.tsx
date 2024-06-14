import { ContentCopy } from '@mui/icons-material';
import { Box, IconButton, SxProps, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import CopyScheduleDialog from '$components/dialogs/CopySchedule';

interface CopyScheduleButtonProps {
    index: number;
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function CopyScheduleButton({ index, disabled, buttonSx }: CopyScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Tooltip title="Copy Schedule">
                <span>
                    <IconButton sx={buttonSx} onClick={handleOpen} size="small" disabled={disabled}>
                        <ContentCopy />
                    </IconButton>
                </span>
            </Tooltip>
            <CopyScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

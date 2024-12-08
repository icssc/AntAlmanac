import { Edit as EditIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import RenameScheduleDialog from '$components/dialogs/RenameSchedule';

interface RenameScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

export function RenameScheduleButton({ index, disabled }: RenameScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Tooltip title="Rename Schedule">
                <span>
                    <IconButton onClick={handleOpen} size="small" disabled={disabled}>
                        <EditIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <RenameScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

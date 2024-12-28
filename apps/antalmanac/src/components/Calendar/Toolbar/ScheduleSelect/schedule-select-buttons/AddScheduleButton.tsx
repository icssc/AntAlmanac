import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import AddScheduleDialog from '$components/dialogs/AddSchedule';

interface AddScheduleButtonProps {
    disabled: boolean;
}

/**
 * MenuItem nested in the select menu to add a new schedule through a dialog.
 */
export function AddScheduleButton({ disabled }: AddScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Button color="inherit" onClick={handleOpen} sx={{ display: 'flex', gap: 1 }} disabled={disabled}>
                <AddIcon />
                <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                    Add Schedule
                </Typography>
            </Button>
            <AddScheduleDialog fullWidth open={open} onClose={handleClose} />
        </Box>
    );
}

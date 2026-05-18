import AddScheduleDialog from '$components/dialogs/AddSchedule';
import { useFallbackStore } from '$stores/FallbackStore';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

/**
 * MenuItem nested in the select menu to add a new schedule through a dialog.
 */
export function AddScheduleButton() {
    const fallbackMode = useFallbackStore(useShallow((state) => state.fallbackMode));
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Button color="inherit" onClick={handleOpen} sx={{ display: 'flex', gap: 1 }} disabled={fallbackMode}>
                <AddIcon />
                <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                    Add Schedule
                </Typography>
            </Button>
            <AddScheduleDialog fullWidth open={open} onClose={handleClose} />
        </Box>
    );
}

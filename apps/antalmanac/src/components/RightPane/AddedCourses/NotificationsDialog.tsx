import { Notifications } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, SxProps, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import { NotificationsTable } from '$components/RightPane/AddedCourses/NotificationsTable';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Notifications Menu">
                <span>
                    <IconButton sx={buttonSx} onClick={handleOpen} size="small" disabled={disabled}>
                        <Notifications />
                    </IconButton>
                </span>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Manage Active Course Notifications</DialogTitle>
                <DialogContent>
                    <NotificationsTable />
                </DialogContent>
            </Dialog>
        </>
    );
}

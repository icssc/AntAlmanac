'use client';

import { useIsMobile } from '$hooks/useIsMobile';
import { useSnackbarStore } from '$stores/SnackbarStore';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';
import { mergeSx } from '@mui/x-date-pickers/internals';

export const NotificationSnackbar = () => {
    const { open, snackbarClosed, message, severity, durationSeconds, position, style } = useSnackbarStore();

    const isMobile = useIsMobile();

    const snackbarKey = open ? Date.now() : null;

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        snackbarClosed();
    };

    return (
        <Snackbar
            key={snackbarKey}
            open={open}
            autoHideDuration={durationSeconds * 1000}
            anchorOrigin={position}
            onClose={handleClose}
            sx={mergeSx(
                (theme) => ({
                    /* Ensure snackbars sit above the mobile navigation tabs */
                    marginBottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 64px)' : undefined,
                    [theme.breakpoints.up('sm')]: { minWidth: '288px' },
                }),
                style
            )}
        >
            <Alert
                severity={severity}
                variant="filled"
                onClose={handleClose}
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

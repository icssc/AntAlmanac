'use client';

import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

import { useSnackbarStore } from '$stores/SnackbarStore';

export const NotificationSnackbar = () => {
    const { open, snackbarClosed, message, severity, durationSeconds, position, style } = useSnackbarStore();

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
            sx={style}
            className="notification-snackbar-container"
        >
            <Alert
                severity={severity}
                variant="filled"
                onClose={handleClose}
                sx={(theme) => ({
                    width: '100%',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                })}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

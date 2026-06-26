'use client';

import { mergeSx } from '$lib/helpers';
import { useSnackbarStore } from '$stores/SnackbarStore';
import { Alert, Snackbar, type SnackbarCloseReason } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

export const NotificationSnackbar = () => {
    const { open, snackbarClosed, message, severity, durationSeconds, position, style } = useSnackbarStore(
        useShallow((store) => ({
            open: store.open,
            snackbarClosed: store.snackbarClosed,
            message: store.message,
            severity: store.severity,
            durationSeconds: store.durationSeconds,
            position: store.position,
            style: store.style,
        }))
    );

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
                    marginBottom: { default: 'calc(env(safe-area-inset-bottom, 0px) + 64px)', sm: 0 },
                    [theme.breakpoints.up('sm')]: { minWidth: '288px' },
                }),
                style
            )}
        >
            <Alert
                severity={severity}
                variant="filled"
                onClose={handleClose}
                sx={(theme) => ({
                    width: '100%',
                    color: theme.vars.palette.common.white,
                    display: 'flex',
                    alignItems: 'center',
                })}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

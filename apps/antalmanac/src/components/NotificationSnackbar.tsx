import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ProviderContext, withSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';

import AppStore from '$stores/AppStore';

export interface SnackbarPosition {
    horizontal: 'left' | 'right';
    vertical: 'bottom' | 'top';
}

export const NotificationSnackbar = withSnackbar(({ enqueueSnackbar, closeSnackbar }: ProviderContext) => {
    const snackbarAction = useCallback(
        (key: string | number) => {
            return (
                <IconButton
                    key="close"
                    color="inherit"
                    onClick={() => {
                        closeSnackbar(key);
                    }}
                >
                    <Close sx={{ fontSize: 20 }} />
                </IconButton>
            );
        },
        [closeSnackbar]
    );

    const openSnackbar = useCallback(() => {
        enqueueSnackbar(AppStore.getSnackbarMessage(), {
            variant: AppStore.getSnackbarVariant(),
            // @ts-expect-error notistack type claims it doesn't support `duration`, but this still runs without errors 🤷‍♂️
            duration: AppStore.getSnackbarDuration(),
            position: AppStore.getSnackbarPosition(),
            action: snackbarAction,
            style: AppStore.getSnackbarStyle(),
        });
    }, [enqueueSnackbar, snackbarAction]);

    useEffect(() => {
        AppStore.on('openSnackbar', openSnackbar);

        return () => {
            AppStore.off('openSnackbar', openSnackbar);
        };
    }, [openSnackbar]);

    return null;
});

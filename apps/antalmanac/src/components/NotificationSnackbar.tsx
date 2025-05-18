import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ProviderContext, withSnackbar, SnackbarKey } from 'notistack';
import { useCallback, useEffect } from 'react';

import AppStore from '$stores/AppStore';

export const NotificationSnackbar = withSnackbar(({ enqueueSnackbar, closeSnackbar }: ProviderContext) => {
    const snackbarAction = useCallback(
        (key: SnackbarKey) => {
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
            autoHideDuration: AppStore.getSnackbarDuration(),
            anchorOrigin: AppStore.getSnackbarPosition(),
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

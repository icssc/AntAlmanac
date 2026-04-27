import { AlertDialog } from '$components/AlertDialog';
import { AppSwitcher } from '$components/Header/AppSwitcher';
import { FriendsButton } from '$components/Header/Friends/FriendsButton';
import { Import } from '$components/Header/Import';
import { Save } from '$components/Header/Save';
import { Signin } from '$components/Header/Signin';
import { Signout } from '$components/Header/Signout';
import {
    getLocalStorageDataCache,
    getLocalStorageImportedUser,
    removeLocalStorageDataCache,
    removeLocalStorageImportedUser,
} from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useIsMobile } from '$src/hooks/useIsMobile';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { AppBar, Box, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export function Header() {
    const [openSuccessfulSaved, setOpenSuccessfulSaved] = useState(false);
    const [openSignoutDialog, setOpenSignoutDialog] = useState(false);
    const importedUser = getLocalStorageImportedUser() ?? '';
    const { sessionIsValid } = useSessionStore();
    const isMobile = useIsMobile();

    const clearStorage = useCallback(() => {
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    }, []);

    const handleCloseSuccessfulSaved = () => {
        setOpenSuccessfulSaved(false);
        clearStorage();
    };

    const handleLogoutComplete = () => {
        setOpenSignoutDialog(true);
    };

    const handleCloseSignoutDialog = () => {
        setOpenSignoutDialog(false);
        window.location.reload();
    };

    useEffect(() => {
        const dataCache = getLocalStorageDataCache() ?? '';

        if (importedUser !== '' && sessionIsValid) {
            setOpenSuccessfulSaved(true);
        } else if (dataCache !== '' && sessionIsValid) {
            openSnackbar('success', `Unsaved changes have been saved to your account!`);
            clearStorage();
        }
    }, [importedUser, sessionIsValid, clearStorage]);

    return (
        <Box
            sx={{
                backgroundColor: BLUE,
                paddingTop: 'env(safe-area-inset-top)',
                fontSize: '10.5px',
                '@media (min-width: 800px)': {
                    fontSize: '12.25px',
                },
            }}
        >
            <AppBar
                position="static"
                color="primary"
                sx={{
                    height: 52,
                    px: 1,
                    boxShadow: 'none',
                    backgroundColor: BLUE,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        height: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={1}>
                        <AppSwitcher isMobile={isMobile} />
                    </Stack>

                    <Stack direction="row" alignItems="center">
                        <FriendsButton />
                        <Import key="studylist" />
                        <Save />
                        {sessionIsValid ? <Signout onLogoutComplete={handleLogoutComplete} /> : <Signin />}
                    </Stack>

                    <AlertDialog
                        open={openSuccessfulSaved}
                        title={`Schedule from "${importedUser}" has been saved to your account!`}
                        severity="success"
                        onClose={handleCloseSuccessfulSaved}
                    >
                        NOTE: All changes made to your schedules will be saved to your Google account
                    </AlertDialog>
                    <AlertDialog
                        open={openSignoutDialog}
                        title="Signed out successfully"
                        severity="info"
                        onClose={handleCloseSignoutDialog}
                    >
                        You have successfully signed out. Close to continue browsing AntAlmanac.
                    </AlertDialog>
                </Box>
            </AppBar>
        </Box>
    );
}

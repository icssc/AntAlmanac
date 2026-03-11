import { Keyboard } from '@mui/icons-material';
import { AppBar, Box, IconButton, Stack, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { AppSwitcher } from '$components/Header/AppSwitcher';
import { Import } from '$components/Header/Import';
import { Save } from '$components/Header/Save';
import { Signin } from '$components/Header/Signin';
import { Signout } from '$components/Header/Signout';
import { KeyboardShortcutsModal } from '$components/KeyboardShortcutsModal/KeyboardShortcutsModal';
import { isMacPlatform } from '$lib/keyboardShortcuts';
import {
    getLocalStorageDataCache,
    getLocalStorageImportedUser,
    removeLocalStorageDataCache,
    removeLocalStorageImportedUser,
} from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useIsMobile } from '$src/hooks/useIsMobile';
import { useKeyboardShortcutsModal } from '$src/hooks/useKeyboardShortcutsModal';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const [openSuccessfulSaved, setOpenSuccessfulSaved] = useState(false);
    const [openSignoutDialog, setOpenSignoutDialog] = useState(false);
    const importedUser = getLocalStorageImportedUser() ?? '';
    const { session, sessionIsValid } = useSessionStore();
    const isMobile = useIsMobile();
    const { open: shortcutsOpen, openModal: openShortcuts, closeModal: closeShortcuts } = useKeyboardShortcutsModal();

    const clearStorage = () => {
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    };

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

        if (importedUser !== '' && session) {
            setOpenSuccessfulSaved(true);
        } else if (dataCache !== '' && session) {
            openSnackbar('success', `Unsaved changes have been saved to your account!`);
            clearStorage();
        }
    }, [importedUser, session]);

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

                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <Tooltip title={`Keyboard shortcuts (${isMacPlatform() ? '⌘' : 'Ctrl'}+/)`} enterTouchDelay={0}>
                            <IconButton
                                color="inherit"
                                size="small"
                                aria-label="Keyboard shortcuts"
                                onClick={openShortcuts}
                                sx={{ color: 'rgba(255,255,255,0.9)' }}
                            >
                                <Keyboard fontSize="small" />
                            </IconButton>
                        </Tooltip>
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
                    <KeyboardShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />
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

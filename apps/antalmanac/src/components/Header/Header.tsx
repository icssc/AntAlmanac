import { AppBar, Box, Stack, Snackbar, Alert, Button } from '@mui/material';
import { useEffect, useState } from 'react';

import { Import } from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

import { openSnackbar } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import {
    getLocalStorageDataCache,
    removeLocalStorageImportedUser,
    removeLocalStorageDataCache,
    getLocalStorageImportedUser,
} from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useSessionStore } from '$stores/SessionStore';
import { useToggleStore } from '$stores/ToggleStore';

export function Header() {
    const [openSuccessfulSaved, setOpenSuccessfulSaved] = useState(false);
    const importedUser = getLocalStorageImportedUser() ?? '';
    const { session } = useSessionStore();
    const { openAutoSaveWarning } = useToggleStore();

    const clearStorage = () => {
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    };

    const handleCloseSuccessfulSaved = () => {
        setOpenSuccessfulSaved(false);
        clearStorage();
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
        <AppBar
            position="static"
            color="primary"
            sx={{
                height: 52,
                padding: 1,
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
                <Logo />

                <Stack direction="row">
                    <SaveFunctionality />
                    <LoadSaveScheduleFunctionalityButton />
                    <Import key="studylist" />
                    <Login />
                    <AppDrawer key="settings" />
                </Stack>

                <Snackbar open={openAutoSaveWarning} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert
                        severity="warning"
                        variant="filled"
                        sx={{ display: 'flex', alignItems: 'center', fontSize: 'small' }}
                    >
                        DISCLAIMER: Legacy (username-based) schedules can no longer be saved. Please log in with
                        <Button
                            color="inherit"
                            variant="text"
                            size="small"
                            onClick={() => (window.location.href = '/login')}
                            sx={{
                                textTransform: 'none',
                                padding: 0,
                                fontSize: 'inherit',
                                textDecoration: 'underline',
                            }}
                        >
                            Google
                        </Button>
                        to <strong>save</strong> your schedule(s) and changes.
                    </Alert>
                </Snackbar>

                <AlertDialog
                    open={openSuccessfulSaved}
                    title={`Schedule from "${importedUser}" has been saved to your account!`}
                    severity="success"
                    onClose={handleCloseSuccessfulSaved}
                >
                    NOTE: All changes made to your schedules will be saved to your Google account
                </AlertDialog>
            </Box>
        </AppBar>
    );
}

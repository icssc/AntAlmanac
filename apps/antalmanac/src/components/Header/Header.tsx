import { AppBar, Box, Stack } from '@mui/material';
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

export function Header() {
    const [openSuccessfulSaved, setOpenSuccessfulSaved] = useState(false);
    const importedUser = getLocalStorageImportedUser() ?? '';
    const { session } = useSessionStore();

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

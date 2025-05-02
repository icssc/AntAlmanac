import { AppBar, Box, Stack, DialogContentText } from '@mui/material';
import { useEffect, useState } from 'react';

import Import from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

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
    const [savedId, setSavedId] = useState('');
    const { session } = useSessionStore();
    const [alertDialog, setAlertDialog] = useState({
        alertImportUser: false,
        alertImportUnsavedChanges: false,
    });

    const handleCloseAlertDialog = () => {
        setAlertDialog((prev) => ({ ...prev, alertImportUser: false, alertImportUnsavedChanges: false }));
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    };

    useEffect(() => {
        const importedUser = getLocalStorageImportedUser();
        const dataCache = getLocalStorageDataCache();

        if (importedUser && importedUser !== '') {
            setSavedId(importedUser);
            setAlertDialog((prev) => ({ ...prev, alertImportUser: true }));
        } else if (dataCache && dataCache !== '' && session) {
            setAlertDialog((prev) => ({ ...prev, alertImportUnsavedChanges: true }));
        }
    }, [session]);
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
            </Box>

            <AlertDialog
                title={`Schedule "${savedId}" has been saved to your account!`}
                open={alertDialog.alertImportUser}
                onClose={handleCloseAlertDialog}
                severity="info"
                defaultAction
            >
                Note: All changes made to your schedule will be saved to your Google account
            </AlertDialog>

            <AlertDialog
                title={`You have saved recent changes to your schedules!`}
                open={alertDialog.alertImportUnsavedChanges}
                onClose={handleCloseAlertDialog}
                severity="info"
                defaultAction
            >
                <DialogContentText>
                    Note: all changes saved to your schedule will be saved via your Google account
                </DialogContentText>
            </AlertDialog>
        </AppBar>
    );
}

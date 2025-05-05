import { AppBar, Box, Stack } from '@mui/material';
import { useEffect } from 'react';

import Import from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

import { openSnackbar } from '$actions/AppStoreActions';
import {
    getLocalStorageDataCache,
    removeLocalStorageImportedUser,
    removeLocalStorageDataCache,
    getLocalStorageImportedUser,
} from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const { session } = useSessionStore();

    const clearStorage = () => {
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    };

    useEffect(() => {
        const importedUser = getLocalStorageImportedUser() ?? '';
        const dataCache = getLocalStorageDataCache() ?? '';

        if (importedUser !== '' && session) {
            openSnackbar('success', `${importedUser} has been saved to your account!`);
            clearStorage();
        } else if (dataCache !== '' && session) {
            openSnackbar('success', 'All changes have been saved to your account!');
            clearStorage();
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
        </AppBar>
    );
}

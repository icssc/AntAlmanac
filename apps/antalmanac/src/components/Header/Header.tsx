import { AppBar, Box, Stack, DialogContentText } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Import from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

import { isEmptySchedule, loadSchedule } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { LoadingScreen } from '$components/LoadingScreen';
import trpc from '$lib/api/trpc';
import {
    getLocalStorageDataCache,
    setLocalStorageImportedUser,
    getLocalStorageUserId,
    removeLocalStorageUserId,
    removeLocalStorageImportedUser,
} from '$lib/localStorage';
// import { getLocalStorageDataCache, getLocalStorageUserId } from '$lib/localStorage';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const { session, updateSession: setSession } = useSessionStore();
    const [progress, setProgress] = useState(false);
    const [savedId, setSavedId] = useState('');
    const [alertDialog, setAlertDialog] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const handleSearchParamsChange = useCallback(async () => {
        try {
            const code = searchParams.get('code');
            if (code) {
                const { sessionToken, userId, providerId } = await trpc.userData.handleGoogleCallback.mutate({
                    code: code,
                    token: session ?? '',
                });

                if (sessionToken && providerId) {
                    setProgress(true);
                    await setSession(sessionToken);
                    const savedUserId = getLocalStorageUserId() ?? '';
                    const savedData = getLocalStorageDataCache();
                    setSavedId(savedUserId);

                    const userData = await trpc.userData.getUserData.query({ userId: userId });
                    if (isEmptySchedule(userData.userData.schedules)) {
                        if (savedData) {
                            if (savedUserId !== '') {
                                await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                            }
                            setLocalStorageImportedUser(savedUserId);
                            removeLocalStorageUserId();
                            const data = JSON.parse(savedData);
                            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
                            scheduleSaveState.schedules = data;
                            await trpc.userData.saveUserData.mutate({
                                id: providerId,
                                data: {
                                    id: providerId,
                                    userData: scheduleSaveState,
                                },
                            });
                            await loadSchedule(providerId, true, 'GOOGLE');
                            setAlertDialog(true);
                        }
                    }
                    navigate('/');
                    setProgress(false);
                }
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
    }, [searchParams, session, setSession, navigate]);

    const handleCloseAlertDialog = () => {
        setAlertDialog(false);
        removeLocalStorageImportedUser();
    };

    useEffect(() => {
        handleSearchParamsChange();
    }, [handleSearchParamsChange]);
    return (
        <AppBar
            position="static"
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

            <LoadingScreen open={progress} />
            <AlertDialog
                title={`Schedule "${savedId}" has been saved into your account!`}
                open={alertDialog}
                onClose={handleCloseAlertDialog}
                severity="info"
            >
                <DialogContentText>
                    Note: all changes saved to your schedule will be saved via your Google account
                </DialogContentText>
            </AlertDialog>
        </AppBar>
    );
}

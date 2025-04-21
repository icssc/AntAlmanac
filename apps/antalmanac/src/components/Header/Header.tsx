import { AppBar, Box, Stack, Dialog, DialogContent, LinearProgress } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Import from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

import { isEmptySchedule } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { getLocalStorageDataCache, getLocalStorageUserId } from '$lib/localStorage';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const { session, updateSession: setSession } = useSessionStore();
    const [progress, setProgress] = useState(false);
    const [searchParams] = useSearchParams();
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
                    const savedUserId = getLocalStorageUserId();
                    const savedData = getLocalStorageDataCache();

                    const userData = await trpc.userData.getUserData.query({ userId: userId });
                    if (isEmptySchedule(userData.userData.schedules)) {
                        if (savedUserId !== null && savedData) {
                            console.log('guest');
                        } else if (savedData && savedUserId === null) {
                            console.log('google');
                        }
                        if (savedData) {
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
                        }
                    }

                    setProgress(false);
                    window.location.href = '/';
                }
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
    }, [searchParams, session, setSession]);

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

            <Dialog fullScreen open={progress}>
                {/* <img src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading courses" /> */}
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Logo />
                    <LinearProgress sx={{ width: '25%', marginTop: 2 }} />
                </DialogContent>
            </Dialog>
        </AppBar>
    );
}

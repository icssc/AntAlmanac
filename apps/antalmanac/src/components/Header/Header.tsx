import { AppBar, Box, Stack } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Import from './Import';
import LoadSaveScheduleFunctionalityButton from './Load';
import Login from './Login';
import { Logo } from './Logo';
import SaveFunctionality from './Save';
import AppDrawer from './SettingsMenu';

import { isEmptySchedule, loadSchedule } from '$actions/AppStoreActions';
import { LoadingScreen } from '$components/LoadingScreen';
import trpc from '$lib/api/trpc';
import { getLocalStorageDataCache, removeLocalStorageUserId, getLocalStorageUserId } from '$lib/localStorage';
// import { getLocalStorageDataCache, getLocalStorageUserId } from '$lib/localStorage';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const { session, updateSession: setSession } = useSessionStore();
    const [progress, setProgress] = useState(false);
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
                    removeLocalStorageUserId();
                    const savedData = getLocalStorageDataCache();

                    const userData = await trpc.userData.getUserData.query({ userId: userId });
                    if (isEmptySchedule(userData.userData.schedules)) {
                        if (savedData) {
                            if (savedUserId !== '') {
                                await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                            }
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
        </AppBar>
    );
}

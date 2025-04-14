import { AppBar, Box, Stack, Dialog, DialogContent, LinearProgress } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Import from './Import';
// import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import LoadSaveScheduleFunctionalityButton from './LoadSaveFunctionalityButton';
import Login from './Login';
import { Logo } from './Logo';
import AppDrawer from './SettingsMenu';

import trpc from '$lib/api/trpc';
import { BLUE } from '$src/globals';
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
                const newSession = await trpc.userData.handleGoogleCallback.mutate({
                    code: code,
                    token: session ?? '',
                });

                setProgress(true);
                await setSession(newSession);
                setProgress(false);
                navigate('/');
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
                    {/* <LoadSaveScheduleFunctionality /> */}
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

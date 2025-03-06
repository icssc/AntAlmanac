import { AppBar, Box, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import Login from './Login';
import { Logo } from './Logo';
import AppDrawer from './SettingsMenu';

import trpc from '$lib/api/trpc';
import { BLUE } from '$src/globals';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const { session, updateSession: setSession } = useSessionStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const handleCallback = async () => {
        try {
            const code = searchParams.get('code');
            if (code) {
                const newSession = await trpc.userData.handleGoogleCallback.mutate({
                    code: code,
                    token: session ?? '',
                });

                setSession(newSession);
                navigate('/');
            }
        } catch (error) {
            console.error('Error during authentication', error);
        }
    };

    useEffect(() => {
        handleCallback();
    }, [searchParams]);
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
                    <LoadSaveScheduleFunctionality />
                    <Import key="studylist" />
                    <Login />
                    <AppDrawer key="settings" />
                </Stack>
            </Box>
        </AppBar>
    );
}

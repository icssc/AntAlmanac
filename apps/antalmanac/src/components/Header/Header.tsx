'use client';

import { AlertDialog } from '$components/AlertDialog';
import { AppSwitcher } from '$components/Header/AppSwitcher';
import { Import } from '$components/Header/Import';
import { Save } from '$components/Header/Save';
import { Signin } from '$components/Header/Signin';
import { Signout } from '$components/Header/Signout';
import { useIsMobile } from '$hooks/useIsMobile';
import { BLUE } from '$src/globals';
import { useSessionStore } from '$stores/SessionStore';
import { AppBar, Box, Stack } from '@mui/material';
import { useState } from 'react';

export function Header() {
    const [openSignoutDialog, setOpenSignoutDialog] = useState(false);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const isMobile = useIsMobile();

    const handleLogoutComplete = () => {
        setOpenSignoutDialog(true);
    };

    const handleCloseSignoutDialog = () => {
        setOpenSignoutDialog(false);
        window.location.reload();
    };

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

                    <Stack direction="row" alignItems="center">
                        <Import key="studylist" />
                        <Save />
                        {sessionIsValid ? <Signout onLogoutComplete={handleLogoutComplete} /> : <Signin />}
                    </Stack>

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

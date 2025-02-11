import { AppBar, Box } from '@mui/material';

import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import Login from './Login';
import { Logo } from './Logo';
import AppDrawer from './SettingsMenu';

import { BLUE } from '$src/globals';

export function Header() {
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

                <Box style={{ display: 'flex', flexDirection: 'row' }}>
                    <LoadSaveScheduleFunctionality />
                    <Import key="studylist" />
                    <Login />
                    <AppDrawer key="settings" />
                </Box>
            </Box>
        </AppBar>
    );
}

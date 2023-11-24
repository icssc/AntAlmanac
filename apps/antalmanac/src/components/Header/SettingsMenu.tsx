import { useCallback, useState } from 'react';
import { Box, Button, ButtonGroup, Divider, Drawer, IconButton, Typography } from '@material-ui/core';
import { Close, DarkMode, LightMode, Settings, SettingsBrightness } from '@mui/icons-material';

import { useTimeFormatStore } from '$stores/TimeStore';
import { useThemeStore } from '$stores/ThemeStore';

function ThemeMenu() {
    const setTheme = useThemeStore((store) => store.setTheme);

    const handleThemeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTheme(event.currentTarget.value);
    };

    return (
        <Box sx={{ padding: '1rem 1rem 0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                Theme
            </Typography>

            <ButtonGroup style={{ display: 'flex', placeContent: 'center', width: '100%' }}>
                <Button
                    startIcon={<LightMode fontSize="small" />}
                    style={{ padding: '1rem 2rem', borderRadius: '12px 0px 0px 12px', width: '100%' }}
                    value="light"
                    onClick={handleThemeChange}
                >
                    Light
                </Button>
                <Button
                    startIcon={<SettingsBrightness fontSize="small" />}
                    style={{ padding: '1rem 2rem', width: '100%' }}
                    value="system"
                    onClick={handleThemeChange}
                >
                    System
                </Button>
                <Button
                    startIcon={<DarkMode fontSize="small" />}
                    style={{ padding: '1rem 2rem', borderRadius: '0px 12px 12px 0px', width: '100%' }}
                    value="dark"
                    onClick={handleThemeChange}
                >
                    Dark
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function TimeMenu() {
    const setTimeFormat = useTimeFormatStore((store) => store.setTimeFormat);

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTimeFormat(event.currentTarget.value == 'true');
    };

    return (
        <Box sx={{ padding: '1rem 1rem 0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                Time
            </Typography>

            <ButtonGroup style={{ display: 'flex', placeContent: 'center', width: '100%' }}>
                <Button
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        fontSize: '12px',
                    }}
                    value="false"
                    onClick={handleTimeFormatChange}
                    fullWidth={true}
                >
                    12 Hour
                </Button>
                <Button
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0px 12px 12px 0px',
                        width: '100%',
                        fontSize: '12px',
                    }}
                    value="true"
                    onClick={handleTimeFormatChange}
                >
                    24 Hour
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function SettingsMenu() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = useCallback(() => {
        setDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    return (
        <>
            <Button onClick={handleDrawerOpen} color="inherit" startIcon={<Settings />}>
                Settings
            </Button>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                PaperProps={{ style: { borderRadius: '10px 0 0 10px' } }}
                variant="temporary"
            >
                <Box style={{ width: '360px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                        }}
                    >
                        <Typography variant="h6">Settings</Typography>
                        <IconButton size="medium" onClick={handleDrawerClose}>
                            <Close fontSize="inherit" />
                        </IconButton>
                    </Box>
                    <Divider />

                    <ThemeMenu />
                    <TimeMenu />
                </Box>
            </Drawer>
        </>
    );
}

export default SettingsMenu;

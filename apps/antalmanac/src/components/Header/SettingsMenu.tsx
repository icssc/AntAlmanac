import { useState } from 'react';
import { Box, Button, ButtonGroup, Divider, Drawer, IconButton, Typography } from '@material-ui/core';
import { Close, DarkMode, LightMode, Settings, SettingsBrightness } from '@mui/icons-material';

import { toggleTheme } from '$actions/AppStoreActions';
import { useTimeFormatStore } from '$stores/TimeStore';

function ThemeMenu() {
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
                    onClick={(value) => toggleTheme(value)}
                >
                    Light
                </Button>
                <Button
                    startIcon={<SettingsBrightness fontSize="small" />}
                    style={{ padding: '1rem 2rem', width: '100%' }}
                    value="system"
                    onClick={(value) => toggleTheme(value)}
                >
                    System
                </Button>
                <Button
                    startIcon={<DarkMode fontSize="small" />}
                    style={{ padding: '1rem 2rem', borderRadius: '0px 12px 12px 0px', width: '100%' }}
                    value="dark"
                    onClick={(value) => toggleTheme(value)}
                >
                    Dark
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function TimeMenu() {
    const handleTimeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        useTimeFormatStore.getState().setTimeFormat(event.currentTarget.value == 'true');
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
                    onClick={(value) => handleTimeChange(value)}
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
                    onClick={(value) => handleTimeChange(value)}
                >
                    24 Hour
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function SettingsMenu() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    setDrawerOpen(true);
                }}
                color="inherit"
                startIcon={<Settings />}
            >
                Settings
            </Button>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                }}
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
                        <IconButton
                            size="medium"
                            onClick={() => {
                                setDrawerOpen(false);
                            }}
                        >
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

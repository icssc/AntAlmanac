import { useCallback, useState } from 'react';
import { Box, Button, ButtonGroup, Drawer, IconButton, Switch, Typography, useMediaQuery } from '@material-ui/core';
import { Divider, Stack } from '@mui/material';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { Close, DarkMode, LightMode, Settings, SettingsBrightness } from '@mui/icons-material';

import { usePreviewStore, useThemeStore, useTimeFormatStore } from '$stores/SettingsStore';

const lightSelectedStyle: CSSProperties = {
    backgroundColor: '#F0F7FF',
    borderColor: '#007FFF',
    color: '#007FFF',
};

const darkSelectedStyle: CSSProperties = {
    backgroundColor: '#003A7570',
    borderColor: '#0059B2',
    color: '#99CCF3',
};

function getSelectedStyle(buttonValue: string, themeSetting: string, appTheme: string) {
    return themeSetting === buttonValue ? (appTheme == 'dark' ? darkSelectedStyle : lightSelectedStyle) : {};
}

function ThemeMenu() {
    const [themeSetting, appTheme, setTheme] = useThemeStore((store) => [
        store.themeSetting,
        store.appTheme,
        store.setAppTheme,
    ]);

    const handleThemeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTheme(event.currentTarget.value as 'light' | 'dark' | 'system');
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                Theme
            </Typography>

            <ButtonGroup style={{ display: 'flex', placeContent: 'center', width: '100%', borderColor: 'unset' }}>
                <Button
                    startIcon={<LightMode fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        ...getSelectedStyle('light', themeSetting, appTheme),
                    }}
                    value="light"
                    onClick={handleThemeChange}
                >
                    Light
                </Button>
                <Button
                    startIcon={<SettingsBrightness fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        width: '100%',
                        ...getSelectedStyle('system', themeSetting, appTheme),
                    }}
                    value="system"
                    onClick={handleThemeChange}
                >
                    System
                </Button>
                <Button
                    startIcon={<DarkMode fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0px 12px 12px 0px',
                        width: '100%',
                        ...getSelectedStyle('dark', themeSetting, appTheme),
                    }}
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
    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore((store) => [store.isMilitaryTime, store.setTimeFormat]);
    const theme = useThemeStore((store) => store.appTheme);

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTimeFormat(event.currentTarget.value == 'true');
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                Time
            </Typography>

            <ButtonGroup
                style={{
                    display: 'flex',
                    placeContent: 'center',
                    width: '100%',
                }}
            >
                <Button
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        fontSize: '12px',
                        ...getSelectedStyle('false', isMilitaryTime.toString(), theme),
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
                        ...getSelectedStyle('true', isMilitaryTime.toString(), theme),
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

function ExperimentalMenu() {
    const [previewMode, setPreviewMode] = usePreviewStore((store) => [store.previewMode, store.setPreviewMode]);

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    return (
        <Stack sx={{ padding: '1rem 1rem 0 1rem', width: '100%', display: 'flex' }} alignItems="middle">
            <Box display="flex" justifyContent="space-between" width={1}>
                <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                    Preview Mode
                </Typography>
                <Switch color="primary" value={previewMode} checked={previewMode} onChange={handlePreviewChange} />
            </Box>
        </Stack>
    );
}

function SettingsMenu() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobileScreen = useMediaQuery('(max-width:750px)');

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
                <Box style={{ width: isMobileScreen ? '300px' : '360px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
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

                    <Divider style={{ marginTop: '16px' }}>
                        <Typography variant="subtitle2">Experimental Features</Typography>
                    </Divider>

                    <ExperimentalMenu />
                </Box>
            </Drawer>
        </>
    );
}

export default SettingsMenu;

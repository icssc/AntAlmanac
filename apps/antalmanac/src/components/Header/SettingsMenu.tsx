import { Box, Button, ButtonGroup, Drawer, Switch, Typography, useMediaQuery } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { Close, DarkMode, Help, LightMode, SettingsBrightness } from '@mui/icons-material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Divider, Stack, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useCallback, useState } from 'react';

import { AboutButtonGroup } from './AboutButtonGoup';
import Export from './Export';
import Import from './Import';

import actionTypesStore from '$actions/ActionTypesStore';
import { autoSaveSchedule } from '$actions/AppStoreActions';
import appStore from '$stores/AppStore';
import useCoursePaneStore from '$stores/CoursePaneStore';
import { usePreviewStore, useThemeStore, useTimeFormatStore, useAutoSaveStore } from '$stores/SettingsStore';


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

function getSelectedStyle(buttonValue: string, themeSetting: string, isDark: boolean) {
    return themeSetting === buttonValue ? (isDark ? darkSelectedStyle : lightSelectedStyle) : {};
}

function ThemeMenu() {
    const [themeSetting, isDark, setTheme] = useThemeStore((store) => [
        store.themeSetting,
        store.isDark,
        store.setAppTheme,
    ]);
    const { forceUpdate } = useCoursePaneStore();

    const handleThemeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        forceUpdate();
        setTheme(event.currentTarget.value as 'light' | 'dark' | 'system');
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                Theme
            </Typography>

            <ButtonGroup style={{ display: 'flex', placeContent: 'center', width: '100%', borderColor: 'unset' }}>
                <Button
                    startIcon={<LightMode fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        ...getSelectedStyle('light', themeSetting, isDark),
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
                        ...getSelectedStyle('system', themeSetting, isDark),
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
                        ...getSelectedStyle('dark', themeSetting, isDark),
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
    const isDark = useThemeStore((store) => store.isDark);

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
                        ...getSelectedStyle('false', isMilitaryTime.toString(), isDark),
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
                        ...getSelectedStyle('true', isMilitaryTime.toString(), isDark),
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
    const [autoSave, setAutoSave] = useAutoSaveStore((store) => [store.autoSave, store.setAutoSave]);

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    const handleAutoSaveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSave(event.target.checked);

        if (!event.target.checked) return;

        const savedUserID = window.localStorage.getItem('userID');

        if (!savedUserID) return;
        actionTypesStore.emit('autoSaveStart');
        await autoSaveSchedule(savedUserID);
        appStore.unsavedChanges = false;
        actionTypesStore.emit('autoSaveEnd');
    };

    return (
        <Stack sx={{ padding: '1rem 1rem 0 1rem', width: '100%', display: 'flex', alignItems: 'middle' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        Hover to Preview
                    </Typography>
                    <Tooltip title={<Typography>Hover over courses to preview them in your calendar!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch color={'primary'} value={previewMode} checked={previewMode} onChange={handlePreviewChange} />
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        Auto Save
                    </Typography>
                    <Tooltip title={<Typography>Auto Save your schedule!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch color={'primary'} value={autoSave} checked={autoSave} onChange={handleAutoSaveChange} />
            </Box>
        </Stack>
    );
}

function SettingsMenu() {
    return (
        <Box>
            <ThemeMenu />
            <TimeMenu />

            <Divider style={{ marginTop: '16px' }}>
                <Typography variant="subtitle2">Experimental Features</Typography>
            </Divider>

            <ExperimentalMenu />
        </Box>
    );
}

function MobileImportExportButtonGroup() {
    return (
        <ButtonGroup
            size="large"
            style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
                borderColor: 'unset',
            }}
        >
            <Import />
            <Export />
        </ButtonGroup>
    );
}

function AppDrawer() {
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
            <IconButton onClick={handleDrawerOpen} color="inherit" size="large" style={{ padding: '4px' }}>
                <MenuRoundedIcon fontSize="inherit" />
            </IconButton>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                PaperProps={{ style: { borderRadius: '10px 0 0 10px' } }}
                variant="temporary"
            >
                <Box style={{ width: isMobileScreen ? '300px' : '360px', height: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'end',
                            paddingTop: '8px',
                            paddingRight: '12px',
                        }}
                    >
                        <IconButton size="large" onClick={handleDrawerClose} style={{ marginLeft: 'auto' }}>
                            <Close fontSize="inherit" />
                        </IconButton>
                    </Box>

                    {isMobileScreen ? (
                        <>
                            <Divider style={{ marginBottom: '16px' }} />
                            <MobileImportExportButtonGroup />
                            <Divider style={{ marginTop: '12px', marginBottom: '16px' }}>
                                <Typography variant="subtitle2">Settings</Typography>
                            </Divider>
                        </>
                    ) : null}

                    <SettingsMenu />

                    <Box sx={{ padding: '1.5rem', width: '100%', bottom: 0, position: 'absolute' }}>
                        <AboutButtonGroup />
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}

export default AppDrawer;

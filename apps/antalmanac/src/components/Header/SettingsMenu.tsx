import { Close, DarkMode, Help, LightMode, MenuRounded, SettingsBrightness } from '@mui/icons-material';
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    Drawer,
    Stack,
    Switch,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import type { CSSProperties } from '@mui/material/styles/createTypography';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';

import { About } from './About';

import actionTypesStore from '$actions/ActionTypesStore';
import { autoSaveSchedule } from '$actions/AppStoreActions';
import { PlannerButton } from '$components/buttons/Planner';
import { useIsMobile } from '$hooks/useIsMobile';
import { getLocalStorageUserId } from '$lib/localStorage';
import appStore from '$stores/AppStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useAutoSaveStore, usePreviewStore, useThemeStore, useTimeFormatStore } from '$stores/SettingsStore';

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
    const postHog = usePostHog();

    const handleThemeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        forceUpdate();
        setTheme(event.currentTarget.value as 'light' | 'dark' | 'system', postHog);
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                Theme
            </Typography>

            <ButtonGroup
                style={{
                    display: 'flex',
                    placeContent: 'center',
                    width: '100%',
                    borderColor: 'unset',
                }}
            >
                <Button
                    startIcon={<LightMode fontSize="small" />}
                    sx={{
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
                    sx={{
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
                    sx={{
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
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
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
                    sx={{
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
                    sx={{
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

function PlannerMenu() {
    return (
        <Box
            sx={{
                padding: '0 1rem',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <PlannerButton
                buttonSx={{
                    width: '100%',
                }}
            />
        </Box>
    );
}

function ExperimentalMenu() {
    const [previewMode, setPreviewMode] = usePreviewStore((store) => [store.previewMode, store.setPreviewMode]);
    const [autoSave, setAutoSave] = useAutoSaveStore((store) => [store.autoSave, store.setAutoSave]);
    const { sessionIsValid, session } = useSessionStore();
    const { setOpenAutoSaveWarning } = scheduleComponentsToggleStore();

    const postHog = usePostHog();

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    const handleAutoSaveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSave(event.target.checked);

        if (!event.target.checked) return;

        if (!sessionIsValid || !session) {
            setOpenAutoSaveWarning(true);
            return;
        }

        const savedUserID = getLocalStorageUserId();

        if (!savedUserID) return;
        actionTypesStore.emit('autoSaveStart');
        await autoSaveSchedule(savedUserID, { postHog });
        appStore.unsavedChanges = false;
        actionTypesStore.emit('autoSaveEnd');
    };

    return (
        <Stack
            sx={{
                padding: '0 1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'middle',
            }}
        >
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography
                        variant="h6"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            alignContent: 'center',
                        }}
                    >
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
                    <Typography
                        variant="h6"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            alignContent: 'center',
                        }}
                    >
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
    const isMobile = useIsMobile();

    return (
        <Stack gap={2}>
            <ThemeMenu />
            <TimeMenu />

            {isMobile && (
                <Stack gap={2}>
                    <Divider>
                        <Typography variant="subtitle2">Want a 4-year plan?</Typography>
                    </Divider>

                    <PlannerMenu />
                </Stack>
            )}

            <Stack gap={2}>
                <Divider>
                    <Typography variant="subtitle2">Experimental Features</Typography>
                </Divider>

                <ExperimentalMenu />
            </Stack>
        </Stack>
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
                <MenuRounded />
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
                            <Close />
                        </IconButton>
                    </Box>

                    <SettingsMenu />

                    <Box
                        sx={{
                            padding: '1.5rem',
                            width: '100%',
                            bottom: 0,
                            position: 'absolute',
                        }}
                    >
                        <About />
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}

export default AppDrawer;

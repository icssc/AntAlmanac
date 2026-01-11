import { LightMode, Close, SettingsBrightness, DarkMode, Help, MenuRounded } from '@mui/icons-material';
import {
    Avatar,
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
import { CSSProperties } from '@mui/material/styles/createTypography';
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
import { usePreviewStore, useThemeStore, useTimeFormatStore, useAutoSaveStore } from '$stores/SettingsStore';
import { User } from '@packages/antalmanac-types';

const lightSelectedStyle: CSSProperties = {
    backgroundColor: '#1976d2', // MUI primary main color
    color: '#fff',
};

const darkSelectedStyle: CSSProperties = {
    backgroundColor: '#1976d2', // Same as light - uses primary color
    color: '#fff',
};

const lightUnselectedStyle: CSSProperties = {
    backgroundColor: '#f8f9fa',
    color: 'inherit',
};

const darkUnselectedStyle: CSSProperties = {
    backgroundColor: 'transparent', // PeterPortal doesn't set a background for dark unselected
    color: 'inherit',
};

function getSelectedStyle(buttonValue: string, themeSetting: string, isDark: boolean): CSSProperties {
    if (themeSetting === buttonValue) {
        return isDark ? darkSelectedStyle : lightSelectedStyle;
    } else {
        return isDark ? darkUnselectedStyle : lightUnselectedStyle;
    }
}

function ThemeMenu() {
    const [themeSetting, isDark, setTheme] = useThemeStore((store) => [
        store.themeSetting,
        store.isDark,
        store.setAppTheme,
    ]);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();

    const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
        forceUpdate();
        setTheme(value, postHog);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Theme
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    border: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                    borderRadius: '4px',
                    mb: 1.5,
                }}
            >
                {[
                    { value: 'light', label: 'Light', icon: <LightMode fontSize="medium" /> },
                    { value: 'system', label: 'System', icon: <SettingsBrightness fontSize="medium" /> },
                    { value: 'dark', label: 'Dark', icon: <DarkMode fontSize="small" /> },
                ].map((tab, index) => {
                    const isSelected = themeSetting === tab.value;

                    return (
                        <Box
                            key={tab.value}
                            onClick={() => handleThemeChange(tab.value as 'light' | 'dark' | 'system')}
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                backgroundColor: isSelected ? '#1976d2' : isDark ? '#333333' : '#f8f9fa',
                                color: isSelected ? '#fff' : '#1976d2',
                                borderRight: index < 2 ? `1px solid ${isDark ? '#8886' : '#d3d4d5'}` : 'none',
                                borderTopLeftRadius: tab.value === 'light' ? 4 : 0,
                                borderBottomLeftRadius: tab.value === 'light' ? 4 : 0,
                                borderTopRightRadius: tab.value === 'dark' ? 4 : 0,
                                borderBottomRightRadius: tab.value === 'dark' ? 4 : 0,
                                '&:hover': {
                                    backgroundColor: isSelected ? '#1976d2' : isDark ? '#424649' : '#d3d4d5',
                                },
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function TimeMenu() {
    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore((store) => [store.isMilitaryTime, store.setTimeFormat]);
    const isDark = useThemeStore((store) => store.isDark);

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLDivElement>) => {
        const value = event.currentTarget.getAttribute('data-value');
        setTimeFormat(value === 'true');
    };

    return (
        <Box sx={{ pt: 0.5, width: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Time
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                     border: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                    borderRadius: '4px',
                    mb: 1.5,
                }}
            >
                  <Box
                    data-value="false"
                    onClick={handleTimeFormatChange}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        backgroundColor: !isMilitaryTime ? '#1976d2' : isDark ? '#333333' : '#f8f9fa',
                        color: !isMilitaryTime ? '#fff' : '#1976d2',
                        borderRight: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                        '&:hover': {
                            backgroundColor: !isMilitaryTime ? '#1976d2' : isDark ? '#424649' : '#d3d4d5',
                        },
                    }}
                >
                    12 Hour
                    </Box>
                <Box
                    data-value="true"
                    onClick={handleTimeFormatChange}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 20px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        backgroundColor: isMilitaryTime ? '#1976d2' : isDark ? '#333333' : '#f8f9fa',
                        color: isMilitaryTime ? '#fff' : '#1976d2',
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                        '&:hover': {
                            backgroundColor: isMilitaryTime ? '#1976d2' : isDark ? '#424649' : '#d3d4d5',
                        },
                    }}
                >
                    24 Hour
                       </Box>
            </Box>
        </Box>
    );
}


function PlannerMenu() {
    return (
        <Box sx={{ padding: '0 1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
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
        await autoSaveSchedule(savedUserID, undefined, postHog);
        appStore.unsavedChanges = false;
        actionTypesStore.emit('autoSaveEnd');
    };

    return (
        <Stack sx={{ width: '100%', display: 'flex', alignItems: 'middle' }}>
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

function UserProfileSection({ user }: { user: User | null }) {
    if (!user) return null;
    const theme = useTheme()

    return (
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
                src={user.avatar}
                alt={user.name ?? 'User'}
                sx={{ width: 50, height: 50 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    style={{
                        fontSize: '18px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 'bold',
                        paddingBottom: '8px',
                        margin: 0,
                        lineHeight: 1,
                    }}
                >
                    {user.name}
                </Typography>
                <Typography
                    style={{
                        fontSize: '14px',
                        color: theme.palette.mode === 'dark' ? '#96969b' : '#606166',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingBottom: '4px',
                        margin: 0,
                        lineHeight: 1,
                        fontWeight: 600
                    }}
                >
                    {user.email}
                </Typography>
            </Box>
        </Box>
    );
}

export function SettingsMenu({ user }: { user: User | null }) {
        const isMobile = useIsMobile();
    return (
        <Stack>
            <UserProfileSection user={user} />

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
            <Stack >
                <Divider>
                    <Typography variant="subtitle2">Experimental Features</Typography>
                </Divider>

                <ExperimentalMenu />
                <Divider style={{ marginTop: '10px', marginBottom: '12px' }}/>
                <About/>
            </Stack>
        </Stack>
    );
}


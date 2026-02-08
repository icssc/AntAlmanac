import { LightMode, SettingsBrightness, DarkMode } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

import { BLUE, LIGHT_BLUE } from '$src/globals';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useThemeStore } from '$stores/SettingsStore';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: <LightMode fontSize="medium" /> },
    { value: 'system', label: 'System', icon: <SettingsBrightness fontSize="medium" /> },
    { value: 'dark', label: 'Dark', icon: <DarkMode fontSize="small" /> },
];

export function ThemeSelector() {
    const [themeSetting, isDark, setTheme] = useThemeStore((store) => [
        store.themeSetting,
        store.isDark,
        store.setAppTheme,
    ]);

    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();
    const accentColor = isDark ? LIGHT_BLUE : BLUE;

    const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
        forceUpdate();
        setTheme(value, postHog);
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Theme
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    border: `1px solid ${isDark ? '#8886' : '#d3d4d5'}`,
                    borderRadius: '4px',
                }}
            >
                {THEME_OPTIONS.map((tab, index) => {
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
                                minwidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                gap: 0.5,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                backgroundColor: isSelected ? accentColor : isDark ? '#333333' : '#f8f9fa',
                                color: isSelected ? '#fff' : accentColor,
                                borderRight: index < 2 ? `1px solid ${isDark ? '#8886' : '#d3d4d5'}` : 'none',
                                borderTopLeftRadius: tab.value === 'light' ? 4 : 0,
                                borderBottomLeftRadius: tab.value === 'light' ? 4 : 0,
                                borderTopRightRadius: tab.value === 'dark' ? 4 : 0,
                                borderBottomRightRadius: tab.value === 'dark' ? 4 : 0,
                                '&:hover': {
                                    backgroundColor: isSelected ? accentColor : isDark ? '#424649' : '#d3d4d5',
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

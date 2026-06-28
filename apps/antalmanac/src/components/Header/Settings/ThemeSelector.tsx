import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { DarkMode, LightMode, SettingsBrightness } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { usePostHog } from 'posthog-js/react';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: <LightMode fontSize="medium" /> },
    { value: 'system', label: 'System', icon: <SettingsBrightness fontSize="medium" /> },
    { value: 'dark', label: 'Dark', icon: <DarkMode fontSize="medium" /> },
] as const;

type ThemeSetting = (typeof THEME_OPTIONS)[number]['value'];

export function ThemeSelector() {
    const { mode, setMode } = useColorScheme();
    const postHog = usePostHog();

    const handleThemeChange = (value: ThemeSetting) => {
        setMode(value);
        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CHANGE_THEME,
            customProps: {
                themeSetting: value,
            },
        });
    };

    if (!mode) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Theme
            </Typography>

            <Box
                sx={(theme) => ({
                    display: 'flex',
                    border: 1,
                    borderColor: theme.vars.palette.divider,
                    borderRadius: 1,
                })}
            >
                {THEME_OPTIONS.map((tab, index) => {
                    const isSelected = mode === tab.value;

                    return (
                        <Box
                            key={tab.value}
                            onClick={() => handleThemeChange(tab.value)}
                            sx={(theme) => ({
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                gap: 0.5,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                backgroundColor: isSelected
                                    ? theme.vars.palette.primary.main
                                    : theme.vars.palette.settingsSegment.background,
                                color: isSelected
                                    ? theme.vars.palette.primary.contrastText
                                    : theme.vars.palette.secondary.main,
                                borderRight: index < 2 ? 1 : 0,
                                borderColor: theme.vars.palette.divider,
                                borderTopLeftRadius: tab.value === 'light' ? 2 : 0,
                                borderBottomLeftRadius: tab.value === 'light' ? 2 : 0,
                                borderTopRightRadius: tab.value === 'dark' ? 2 : 0,
                                borderBottomRightRadius: tab.value === 'dark' ? 2 : 0,
                                '&:hover': {
                                    backgroundColor: isSelected
                                        ? theme.vars.palette.primary.main
                                        : theme.vars.palette.settingsSegment.hoverBackground,
                                },
                            })}
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

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Description as DescriptionIcon, DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery, Button, IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

interface ToolbarFinalsToggleProps {
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
}

export function ToolbarFinalsToggle({ showFinalsSchedule, toggleDisplayFinalsSchedule }: ToolbarFinalsToggleProps) {
    const theme = useTheme();
    const isDark = useThemeStore((store) => store.isDark);
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xxs'));
    const postHog = usePostHog();

    const handleToggleFinals = useCallback(() => {
        if (!showFinalsSchedule) {
            logAnalytics(postHog, {
                category: analyticsEnum.calendar,
                action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
            });
        }
        toggleDisplayFinalsSchedule();
    }, [toggleDisplayFinalsSchedule, postHog, showFinalsSchedule]);

    return (
        <Tooltip title="Toggle showing finals schedule">
            {isSmallScreen ? (
                <IconButton
                    color={showFinalsSchedule ? 'primary' : 'inherit'}
                    onClick={handleToggleFinals}
                    id={showFinalsSchedule ? 'finals-button-pressed' : 'finals-button'}
                    disabled={fallbackMode}
                    size="small"
                    sx={{
                        border: '1px solid',
                        borderColor: showFinalsSchedule ? theme.palette.primary.main : 'inherit',
                        borderRadius: '4px',
                        padding: '3px',
                        ...(showFinalsSchedule &&
                            isDark && {
                                backgroundColor: theme.palette.primary.main,
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }),
                    }}
                >
                    {showFinalsSchedule ? <DescriptionIcon /> : <DescriptionOutlinedIcon />}
                </IconButton>
            ) : (
                <Button
                    color={showFinalsSchedule ? 'primary' : 'inherit'}
                    variant={showFinalsSchedule ? 'contained' : 'outlined'}
                    onClick={handleToggleFinals}
                    size="small"
                    id={showFinalsSchedule ? 'finals-button-pressed' : 'finals-button'}
                    disabled={fallbackMode}
                >
                    Finals
                </Button>
            )}
        </Tooltip>
    );
}

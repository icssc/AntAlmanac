import {
    Undo as UndoIcon,
    Description as DescriptionIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
} from '@mui/icons-material';
import { useTheme, useMediaQuery, Box, Button, IconButton, Paper, Tooltip } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { useState, useCallback, useEffect, memo } from 'react';

import { undoDelete } from '$actions/AppStoreActions';
import CustomEventDialog from '$components/Calendar/Toolbar/CustomEventDialog';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import { ClearScheduleButton } from '$components/buttons/Clear';
import DownloadButton from '$components/buttons/Download';
import ScreenshotButton from '$components/buttons/Screenshot';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';

function handleUndo(postHog?: PostHog) {
    return () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.UNDO,
        });
        undoDelete(null);
    };
}

export interface CalendarPaneToolbarProps {
    scheduleNames: string[];
    currentScheduleIndex: number;
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
}

/**
 * The root toolbar will pass down the schedule names to its children.
 */
export const CalendarToolbar = memo((props: CalendarPaneToolbarProps) => {
    const theme = useTheme();
    const { showFinalsSchedule, toggleDisplayFinalsSchedule } = props;
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xxs'));

    const postHog = usePostHog();

    const handleToggleFinals = useCallback(() => {
        if (!showFinalsSchedule) {
            logAnalytics(postHog, {
                category: analyticsEnum.calendar.title,
                action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
            });
        }
        toggleDisplayFinalsSchedule();
    }, [toggleDisplayFinalsSchedule]);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                padding: 1,
                borderRadius: '4px 4px 0 0',
            }}
        >
            <Box gap={1} display="flex" alignItems="center">
                <SelectSchedulePopover />
                <Tooltip title="Toggle showing finals schedule">
                    {isSmallScreen ? (
                        <IconButton
                            color={showFinalsSchedule ? 'primary' : 'inherit'}
                            onClick={handleToggleFinals}
                            id={showFinalsSchedule ? 'finals-button-pressed' : 'finals-button'}
                            disabled={skeletonMode}
                            size="small"
                            sx={{
                                border: '1px solid',
                                borderColor: showFinalsSchedule ? 'primary' : 'inherit',
                                borderRadius: '4px',
                                padding: '3px',
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
                            disabled={skeletonMode}
                        >
                            Finals
                        </Button>
                    )}
                </Tooltip>
            </Box>
            <Box flexGrow={1} />

            <Box display="flex" flexWrap="wrap" alignItems="center" gap={0.5}>
                <ScreenshotButton />

                <DownloadButton />

                <Tooltip title="Undo last action">
                    <IconButton onClick={handleUndo(postHog)} size="medium" disabled={skeletonMode}>
                        <UndoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <ClearScheduleButton
                    size="medium"
                    fontSize="small"
                    skeletonMode={skeletonMode}
                    analyticsCategory={analyticsEnum.calendar}
                />

                <CustomEventDialog key="custom" scheduleNames={AppStore.getScheduleNames()} />
            </Box>
        </Paper>
    );
});

CalendarToolbar.displayName = 'CalendarToolbar';

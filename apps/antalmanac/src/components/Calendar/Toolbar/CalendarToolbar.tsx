import { Undo as UndoIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Tooltip } from '@mui/material';
import { useState, useCallback, useEffect, memo } from 'react';

import { undoDelete } from '$actions/AppStoreActions';
import CustomEventDialog from '$components/Calendar/Toolbar/CustomEventDialog';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import { ClearScheduleButton } from '$components/buttons/Clear';
import DownloadButton from '$components/buttons/Download';
import ScreenshotButton from '$components/buttons/Screenshot';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import AppStore from '$stores/AppStore';

function handleUndo() {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.UNDO,
    });
    undoDelete(null);
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
    const { showFinalsSchedule, toggleDisplayFinalsSchedule } = props;
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const [skeletonScheduleNames, setSkeletonScheduleNames] = useState(AppStore.getSkeletonScheduleNames());

    const handleToggleFinals = useCallback(() => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
        });
        toggleDisplayFinalsSchedule();
    }, [toggleDisplayFinalsSchedule]);

    const handleScheduleNamesChange = useCallback(() => {
        setScheduleNames(AppStore.getScheduleNames());
    }, []);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
            setSkeletonScheduleNames(AppStore.getSkeletonScheduleNames());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    useEffect(() => {
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

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
                <SelectSchedulePopover scheduleNames={skeletonMode ? skeletonScheduleNames : scheduleNames} />
                <Tooltip title="Toggle showing finals schedule">
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
                </Tooltip>
            </Box>

            <Box flexGrow={1} />

            <Box display="flex" flexWrap="wrap" alignItems="center" gap={0.5}>
                <ScreenshotButton />

                <DownloadButton />

                <Tooltip title="Undo last action">
                    <IconButton onClick={handleUndo} size="medium" disabled={skeletonMode}>
                        <UndoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <ClearScheduleButton size="medium" fontSize="small" skeletonMode={skeletonMode} />

                <CustomEventDialog key="custom" />
            </Box>
        </Paper>
    );
});

CalendarToolbar.displayName = 'CalendarToolbar';

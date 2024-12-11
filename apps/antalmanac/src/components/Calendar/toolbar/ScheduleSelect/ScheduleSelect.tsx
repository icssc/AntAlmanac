import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Button, Popover, Typography, useTheme } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { changeCurrentSchedule } from '$actions/AppStoreActions';
import { AddScheduleButton } from '$components/Calendar/toolbar/ScheduleSelect/schedule-select-buttons/AddScheduleButton';
import { DeleteScheduleButton } from '$components/Calendar/toolbar/ScheduleSelect/schedule-select-buttons/DeleteScheduleButton';
import { RenameScheduleButton } from '$components/Calendar/toolbar/ScheduleSelect/schedule-select-buttons/RenameScheduleButton';
import { CopyScheduleButton } from '$components/buttons/Copy';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import AppStore from '$stores/AppStore';

function handleScheduleChange(index: number) {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
    });
    changeCurrentSchedule(index);
}

/**
 * Creates an event handler callback that will change the current schedule to the one at a specified index.
 */
function createScheduleSelector(index: number) {
    return () => {
        handleScheduleChange(index);
    };
}

/**
 * Simulates an HTML select element using a popover.
 *
 * Can select a schedule, and also control schedule settings with buttons.
 */
export function SelectSchedulePopover(props: { scheduleNames: string[] }) {
    const theme = useTheme();

    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());
    const [skeletonMode, setSkeletonMode] = useState(() => AppStore.getSkeletonMode());
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    // TODO: maybe these widths should be dynamic based on i.e. the viewport width?
    const minWidth = useMemo(() => 100, []);
    const maxWidth = useMemo(() => 150, []);

    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

    const currentScheduleName = useMemo(() => {
        return props.scheduleNames[currentScheduleIndex];
    }, [props.scheduleNames, currentScheduleIndex]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const handleScheduleIndexChange = useCallback(() => {
        setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
    }, []);

    const handleSkeletonModeChange = () => {
        setSkeletonMode(AppStore.getSkeletonMode());
    };

    useEffect(() => {
        AppStore.on('addedCoursesChange', handleScheduleIndexChange);
        AppStore.on('customEventsChange', handleScheduleIndexChange);
        AppStore.on('colorChange', handleScheduleIndexChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);
        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('addedCoursesChange', handleScheduleIndexChange);
            AppStore.off('customEventsChange', handleScheduleIndexChange);
            AppStore.off('colorChange', handleScheduleIndexChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, [handleScheduleIndexChange]);

    return (
        <Box>
            <Button
                size="small"
                color="inherit"
                variant="outlined"
                onClick={handleClick}
                sx={{ minWidth, maxWidth, justifyContent: 'space-between' }}
            >
                <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                    {currentScheduleName}
                </Typography>
                <ArrowDropDownIcon />
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box padding={1}>
                    {props.scheduleNames.map((name, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1}>
                            <Box flexGrow={1}>
                                <Button
                                    color="inherit"
                                    sx={{
                                        minWidth,
                                        maxWidth,
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        background:
                                            index === currentScheduleIndex ? theme.palette.action.selected : undefined,
                                    }}
                                    onClick={createScheduleSelector(index)}
                                >
                                    <Typography
                                        overflow="hidden"
                                        whiteSpace="nowrap"
                                        textTransform="none"
                                        textOverflow="ellipsis"
                                    >
                                        {name}
                                    </Typography>
                                </Button>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <CopyScheduleButton index={index} disabled={skeletonMode} />
                                <RenameScheduleButton index={index} disabled={skeletonMode} />
                                <DeleteScheduleButton index={index} disabled={skeletonMode} />
                            </Box>
                        </Box>
                    ))}

                    <Box marginY={1} />

                    <AddScheduleButton disabled={skeletonMode} />
                </Box>
            </Popover>
        </Box>
    );
}

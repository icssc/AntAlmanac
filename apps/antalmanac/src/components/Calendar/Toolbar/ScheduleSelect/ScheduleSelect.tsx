import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Button, Popover, Typography, useTheme, Tooltip } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { changeCurrentSchedule } from '$actions/AppStoreActions';
import { SortableList } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableList';
import { AddScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/AddScheduleButton';
import { DeleteScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/DeleteScheduleButton';
import { RenameScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/RenameScheduleButton';
import { CopyScheduleButton } from '$components/buttons/Copy';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';

type EventContext = {
    triggeredBy?: string;
};

type ScheduleItem = {
    id: number;
    name: string;
};

function getScheduleItems(): ScheduleItem[] {
    const { fallback, fallbackSchedules } = useFallbackStore.getState();

    const scheduleNames: string[] = fallback
        ? fallbackSchedules.map((s) => s.scheduleName)
        : AppStore.getScheduleNames();

    return scheduleNames.map((name, index) => ({ id: index, name }));
}

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
export function SelectSchedulePopover() {
    const theme = useTheme();
    const { fallback } = useFallbackStore();

    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());
    const [scheduleMapping, setScheduleMapping] = useState(() => getScheduleItems());

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    // TODO: maybe these widths should be dynamic based on i.e. the viewport width?
    const minWidth = useMemo(() => 100, []);
    const maxWidth = useMemo(() => 150, []);

    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const handleScheduleIndexChange = useCallback(() => {
        setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
    }, []);

    useEffect(() => {
        AppStore.on('addedCoursesChange', handleScheduleIndexChange);
        AppStore.on('customEventsChange', handleScheduleIndexChange);
        AppStore.on('colorChange', handleScheduleIndexChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('addedCoursesChange', handleScheduleIndexChange);
            AppStore.off('customEventsChange', handleScheduleIndexChange);
            AppStore.off('colorChange', handleScheduleIndexChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, [handleScheduleIndexChange]);

    useEffect(() => {
        const handleScheduleNamesChange = (context?: EventContext) => {
            if (context?.triggeredBy === 'reorder') {
                return;
            }

            setScheduleMapping(() => getScheduleItems());
        };

        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [fallback]);

    return (
        <Box>
            <Tooltip
                title={scheduleMapping.at(currentScheduleIndex)?.name}
                enterDelay={200}
                slotProps={{
                    popper: {
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [-2, -10],
                                },
                            },
                        ],
                    },
                }}
                placement="bottom-start"
                disableInteractive
            >
                <Button
                    size="small"
                    color="inherit"
                    variant="outlined"
                    onClick={handleClick}
                    sx={{ minWidth, maxWidth, justifyContent: 'space-between' }}
                >
                    <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                        {scheduleMapping.at(currentScheduleIndex)?.name || null}
                    </Typography>
                    <ArrowDropDownIcon />
                </Button>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box padding={1}>
                    <SortableList
                        items={scheduleMapping}
                        onChange={setScheduleMapping}
                        renderItem={(item) => {
                            const index = scheduleMapping.indexOf(item);
                            return (
                                <SortableList.Item id={item.id}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexGrow: 1,
                                        }}
                                    >
                                        <SortableList.DragHandle disabled={fallback} />
                                        <Box flexGrow={1}>
                                            <Tooltip
                                                title={item.name}
                                                enterDelay={200}
                                                slotProps={{
                                                    popper: {
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [-2, -10],
                                                                },
                                                            },
                                                        ],
                                                    },
                                                }}
                                                placement="bottom-start"
                                                disableInteractive
                                            >
                                                <Button
                                                    color="inherit"
                                                    sx={{
                                                        minWidth,
                                                        maxWidth,
                                                        width: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        background:
                                                            index === currentScheduleIndex
                                                                ? theme.palette.action.selected
                                                                : undefined,
                                                    }}
                                                    onClick={() => createScheduleSelector(index)()}
                                                >
                                                    <Typography
                                                        overflow="hidden"
                                                        whiteSpace="nowrap"
                                                        textTransform="none"
                                                        textOverflow="ellipsis"
                                                    >
                                                        {item.name}
                                                    </Typography>
                                                </Button>
                                            </Tooltip>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <CopyScheduleButton index={index} disabled={fallback} />
                                            <RenameScheduleButton index={index} disabled={fallback} />
                                            <DeleteScheduleButton index={index} disabled={fallback} />
                                        </Box>
                                    </Box>
                                </SortableList.Item>
                            );
                        }}
                    />
                    <Box marginY={1} />
                    <AddScheduleButton disabled={fallback} />
                </Box>
            </Popover>
        </Box>
    );
}

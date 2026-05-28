import { changeCurrentSchedule } from '$actions/AppStoreActions';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { AddScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/AddScheduleButton';
import { DeleteScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/DeleteScheduleButton';
import { RenameScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/RenameScheduleButton';
import { SortableList } from '$components/drag-and-drop/SortableList';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Button, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

// TODO: maybe these widths should be dynamic based on i.e. the viewport width?
const scheduleSelectButtonMinWidth = 100;
const scheduleSelectButtonMaxWidth = 150;

type EventContext = {
    triggeredBy?: string;
};

type ScheduleItem = {
    id: number;
    name: string;
};

function getScheduleItems(items?: string[]): ScheduleItem[] {
    const scheduleNames: string[] = items || AppStore.getScheduleNames();
    return scheduleNames.map((name, index) => ({ id: index, name }));
}

function handleScheduleChange(index: number, postHog?: PostHog) {
    logAnalytics(postHog, {
        category: analyticsEnum.calendar,
        action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
    });
    changeCurrentSchedule(index);
}

/**
 * Simulates an HTML select element using a popover.
 *
 * Can select a schedule, and also control schedule settings with buttons.
 */
export function SelectSchedulePopover() {
    const theme = useTheme();
    const { openScheduleSelect, setOpenScheduleSelect } = useScheduleComponentsToggleStore(
        useShallow((state) => ({
            openScheduleSelect: state.openScheduleSelect,
            setOpenScheduleSelect: state.setOpenScheduleSelect,
        }))
    );

    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());
    const [scheduleMapping, setScheduleMapping] = useState(() => getScheduleItems());
    const { fallbackMode, getFallbackScheduleNames } = useFallbackStore(
        useShallow((store) => ({
            fallbackMode: store.fallbackMode,
            getFallbackScheduleNames: store.getFallbackScheduleNames,
        }))
    );
    const fallbackScheduleMapping = getScheduleItems(getFallbackScheduleNames());

    const anchorElementRef = useRef(null);

    const postHog = usePostHog();

    const handleClick = useCallback(() => {
        setOpenScheduleSelect(true);
    }, [setOpenScheduleSelect]);

    const handleClose = useCallback(() => {
        setOpenScheduleSelect(false);
    }, [setOpenScheduleSelect]);

    const handleScheduleIndexChange = useCallback(() => {
        setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
    }, []);

    const handleSortableListChange = (schedules: ScheduleItem[], activeIndex: number, overIndex: number) => {
        setScheduleMapping(schedules);
        AppStore.reorderSchedule(activeIndex, overIndex);
    };

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
            setScheduleMapping(getScheduleItems());
        };

        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, []);

    const scheduleMappingToUse = fallbackMode ? fallbackScheduleMapping : scheduleMapping;

    return (
        <Box>
            <Tooltip
                title={scheduleMappingToUse[currentScheduleIndex]?.name}
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
                    ref={anchorElementRef}
                    size="small"
                    color="inherit"
                    variant="outlined"
                    onClick={handleClick}
                    sx={{
                        minWidth: scheduleSelectButtonMinWidth,
                        maxWidth: scheduleSelectButtonMaxWidth,
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                        {scheduleMappingToUse[currentScheduleIndex]?.name || null}
                    </Typography>
                    <ArrowDropDownIcon />
                </Button>
            </Tooltip>

            <Popover
                open={openScheduleSelect}
                anchorEl={anchorElementRef.current}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box padding={1}>
                    <SortableList
                        items={scheduleMappingToUse}
                        onChange={handleSortableListChange}
                        renderItem={(item, index) => {
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
                                        <SortableList.DragHandle disabled={fallbackMode} />
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
                                                        minWidth: scheduleSelectButtonMinWidth,
                                                        maxWidth: scheduleSelectButtonMaxWidth,
                                                        width: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        background:
                                                            index === currentScheduleIndex
                                                                ? theme.palette.action.selected
                                                                : undefined,
                                                    }}
                                                    onClick={() => handleScheduleChange(index, postHog)}
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
                                            <CopyScheduleButton index={index} />
                                            <RenameScheduleButton index={index} />
                                            <DeleteScheduleButton index={index} />
                                        </Box>
                                    </Box>
                                </SortableList.Item>
                            );
                        }}
                    />
                    <Box marginY={1} />
                    <AddScheduleButton />
                </Box>
            </Popover>
        </Box>
    );
}

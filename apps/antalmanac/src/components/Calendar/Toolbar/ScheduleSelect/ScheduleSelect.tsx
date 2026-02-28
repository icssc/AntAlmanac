import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Button, Popover, Typography, useTheme, Tooltip } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { changeCurrentSchedule } from '$actions/AppStoreActions';
import { SortableList } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableList';
import { AddScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/AddScheduleButton';
import { DeleteScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/DeleteScheduleButton';
import { RenameScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/RenameScheduleButton';
import { ShareScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/ShareScheduleButton';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { useIsReadonlyView } from '$hooks/useIsReadonlyView';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';

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
 * Creates an event handler callback that will change the current schedule to the one at a specified index.
 */
function createScheduleSelector(index: number, postHog?: PostHog) {
    return () => {
        handleScheduleChange(index, postHog);
    };
}

/**
 * Simulates an HTML select element using a popover.
 *
 * Can select a schedule, and also control schedule settings with buttons.
 */
export function SelectSchedulePopover() {
    const theme = useTheme();
    const isReadonlyView = useIsReadonlyView();
    const { openScheduleSelect, setOpenScheduleSelect } = scheduleComponentsToggleStore();

    const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(null);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [scheduleMapping, setScheduleMapping] = useState(getScheduleItems());
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const [skeletonScheduleMapping, setSkeletonScheduleMapping] = useState(
        getScheduleItems(AppStore.getSkeletonScheduleNames())
    );

    const anchorElementRef = useRef<HTMLButtonElement | null>(null);

    const postHog = usePostHog();

    // TODO: maybe these widths should be dynamic based on i.e. the viewport width?
    const minWidth = useMemo(() => 100, []);
    const maxWidth = useMemo(() => 150, []);

    const handleClick = useCallback(() => {
        setOpenScheduleSelect(true);
    }, [setOpenScheduleSelect]);

    const handleClose = useCallback(() => {
        setOpenScheduleSelect(false);
    }, [setOpenScheduleSelect]);

    const handleScheduleIndexChange = useCallback(() => {
        setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
    }, []);

    useEffect(() => {
        setAnchorElement(anchorElementRef.current);
    }, [anchorElementRef]);

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
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
            setSkeletonScheduleMapping(getScheduleItems(AppStore.getSkeletonScheduleNames()));
        };

        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const scheduleMappingToUse = skeletonMode ? skeletonScheduleMapping : scheduleMapping;
    const displayName = isReadonlyView
        ? AppStore.getScheduleNames()[currentScheduleIndex] || scheduleMappingToUse[currentScheduleIndex]?.name
        : scheduleMappingToUse[currentScheduleIndex]?.name;

    const disableActionButtons = skeletonMode || isReadonlyView;

    return (
        <Box>
            <Tooltip
                title={displayName || ''}
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
                    sx={{ minWidth, maxWidth, justifyContent: 'space-between' }}
                >
                    <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                        {displayName || null}
                    </Typography>
                    <ArrowDropDownIcon />
                </Button>
            </Tooltip>

            <Popover
                open={openScheduleSelect}
                anchorEl={anchorElement}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box padding={1}>
                    <SortableList
                        items={scheduleMappingToUse}
                        onChange={setScheduleMapping}
                        renderItem={(item) => {
                            const index = scheduleMappingToUse.indexOf(item);
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
                                        <SortableList.DragHandle disabled={skeletonMode} />
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
                                                    onClick={() => createScheduleSelector(index, postHog)()}
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
                                            <CopyScheduleButton index={index} disabled={disableActionButtons} />
                                            <RenameScheduleButton index={index} disabled={disableActionButtons} />
                                            <ShareScheduleButton index={index} disabled={disableActionButtons} />
                                            <DeleteScheduleButton index={index} disabled={disableActionButtons} />
                                        </Box>
                                    </Box>
                                </SortableList.Item>
                            );
                        }}
                    />
                    <Box marginY={1} />
                    <AddScheduleButton disabled={disableActionButtons} />
                </Box>
            </Popover>
        </Box>
    );
}

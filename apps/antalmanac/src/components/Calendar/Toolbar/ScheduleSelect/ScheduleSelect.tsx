import { changeCurrentSchedule } from '$actions/AppStoreActions';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { SortableList } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableList';
import { AddScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/AddScheduleButton';
import { DeleteScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/DeleteScheduleButton';
import { RenameScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/RenameScheduleButton';
import { ShareScheduleButton } from '$components/Calendar/Toolbar/ScheduleSelect/schedule-select-buttons/ShareScheduleButton';
import { useIsReadonlyView } from '$hooks/useIsReadonlyView';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { ArrowDropDown as ArrowDropDownIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

    const [anchorElement, setAnchorElement] = useState(null);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [scheduleMapping, setScheduleMapping] = useState(getScheduleItems());
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const [skeletonScheduleMapping, setSkeletonScheduleMapping] = useState(
        getScheduleItems(AppStore.getSkeletonScheduleNames())
    );
    // Map from schedule index to sharedWithFriends boolean (works even for unsaved schedules)
    const [sharingStatuses, setSharingStatuses] = useState<Record<number, boolean>>({});

    const anchorElementRef = useRef(null);

    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);

    const postHog = usePostHog();

    // TODO: maybe these widths should be dynamic based on i.e. the viewport width?
    const minWidth = useMemo(() => 100, []);
    const maxWidth = useMemo(() => 150, []);

    const fetchSharingStatuses = useCallback(async () => {
        if (!sessionIsValid) return;
        try {
            const statuses = await trpc.friends.getScheduleSharingStatuses.query();
            // Map DB results back to local schedule indices by matching IDs
            const map: Record<number, boolean> = {};
            for (const { id, sharedWithFriends } of statuses) {
                const scheduleNames = AppStore.getScheduleNames();
                for (let i = 0; i < scheduleNames.length; i++) {
                    if (AppStore.getScheduleId(i) === id) {
                        map[i] = sharedWithFriends;
                        break;
                    }
                }
            }
            setSharingStatuses(map);
        } catch {
            // Silently fail — sharing status is non-critical
        }
    }, [sessionIsValid]);

    const handleToggleSharing = useCallback(
        async (scheduleIndex: number) => {
            if (!sessionIsValid) return;

            // Always update the icon immediately, regardless of whether the schedule has a DB ID
            const currentValue = sharingStatuses[scheduleIndex] ?? true;
            const newValue = !currentValue;
            setSharingStatuses((prev) => ({ ...prev, [scheduleIndex]: newValue }));

            const scheduleId = AppStore.getScheduleId(scheduleIndex);
            if (!scheduleId) return; // Schedule not saved yet — keep local change, skip DB update

            try {
                const result = await trpc.friends.toggleScheduleSharing.mutate({
                    scheduleId,
                });
                setSharingStatuses((prev) => ({ ...prev, [scheduleIndex]: result.sharedWithFriends }));
            } catch {
                setSharingStatuses((prev) => ({ ...prev, [scheduleIndex]: currentValue }));
            }
        },
        [sessionIsValid, sharingStatuses]
    );

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
        if (openScheduleSelect && sessionIsValid && !skeletonMode && !isReadonlyView) {
            void fetchSharingStatuses();
        }
    }, [openScheduleSelect, sessionIsValid, skeletonMode, isReadonlyView, fetchSharingStatuses]);

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
                                        <SortableList.DragHandle disabled={skeletonMode || isReadonlyView} />
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
                                            {sessionIsValid &&
                                                !disableActionButtons &&
                                                (() => {
                                                    const isShared = sharingStatuses[index] ?? true;
                                                    return (
                                                        <Tooltip
                                                            title={
                                                                isShared
                                                                    ? 'Visible to friends — click to hide'
                                                                    : 'Hidden from friends — click to share'
                                                            }
                                                            disableInteractive
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => void handleToggleSharing(index)}
                                                            >
                                                                {isShared ? (
                                                                    <Visibility fontSize="small" />
                                                                ) : (
                                                                    <VisibilityOff fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    );
                                                })()}
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

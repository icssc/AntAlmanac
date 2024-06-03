import {
    Add as AddIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Edit as EditIcon,
    Undo as UndoIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Popover, Tooltip, Typography, useTheme } from '@mui/material';
import { useState, useMemo, useCallback, useEffect } from 'react';

import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';

import { changeCurrentSchedule, undoDelete } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import DownloadButton from '$components/buttons/Download';
import ScreenshotButton from '$components/buttons/Screenshot';
import AddScheduleDialog from '$components/dialogs/AddSchedule';
import DeleteScheduleDialog from '$components/dialogs/DeleteSchedule';
import RenameScheduleDialog from '$components/dialogs/RenameSchedule';
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

function handleUndo() {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.UNDO,
    });
    undoDelete(null);
}

interface RenameScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

function RenameScheduleButton({ index, disabled }: RenameScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Tooltip title="Rename Schedule">
                <span>
                    <IconButton onClick={handleOpen} size="small" disabled={disabled}>
                        <EditIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <RenameScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

interface DeleteScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

function DeleteScheduleButton({ index, disabled }: DeleteScheduleButtonProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <Box>
            <Tooltip title="Delete Schedule">
                <span>
                    <IconButton
                        onClick={handleOpen}
                        size="small"
                        disabled={AppStore.schedule.getNumberOfSchedules() === 1 || disabled}
                    >
                        <ClearIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <DeleteScheduleDialog fullWidth open={open} index={index} onClose={handleClose} />
        </Box>
    );
}

/**
 * MenuItem nested in the select menu to add a new schedule through a dialog.
 */
function AddScheduleButton() {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button color="inherit" onClick={handleOpen} sx={{ display: 'flex', gap: 1 }}>
                <AddIcon />
                <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                    Add Schedule
                </Typography>
            </Button>
            <AddScheduleDialog fullWidth open={open} onClose={handleClose} />
        </>
    );
}

/**
 * Simulates an HTML select element using a popover.
 *
 * Can select a schedule, and also control schedule settings with buttons.
 */
function SelectSchedulePopover(props: { scheduleNames: string[] }) {
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const theme = useTheme();

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

                    <AddScheduleButton />
                </Box>
            </Popover>
        </Box>
    );
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
function CalendarPaneToolbar(props: CalendarPaneToolbarProps) {
    const { showFinalsSchedule, toggleDisplayFinalsSchedule } = props;
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

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
                <SelectSchedulePopover scheduleNames={scheduleNames} />
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

                <CustomEventDialog key="custom" scheduleNames={AppStore.getScheduleNames()} />
            </Box>
        </Paper>
    );
}

export default CalendarPaneToolbar;

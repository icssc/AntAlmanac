import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Autocomplete,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Tooltip,
    Typography,
    useMediaQuery,
    type SelectProps,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreHoriz as MoreHorizIcon,
    Undo as UndoIcon,
} from '@mui/icons-material';

import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import ExportCalendar from './Toolbar/ExportCalendar';
import ScreenshotButton from './Toolbar/ScreenshotButton';
import AppStore from '$stores/AppStore';
import AddScheduleDialog from '$components/dialogs/AddSchedule';
import RenameScheduleDialog from '$components/dialogs/RenameSchedule';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { changeCurrentSchedule, clearSchedules, undoDelete } from '$actions/AppStoreActions';

const handleScheduleChange = (_event: unknown, x: { label: string; value: number }) => {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
    });
    changeCurrentSchedule(x.value);
};

function handleUndo() {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.UNDO,
    });
    undoDelete(null);
}

function handleClearSchedule() {
    if (window.confirm('Are you sure you want to clear this schedule?')) {
        clearSchedules();
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CLEAR_SCHEDULE,
        });
    }
}

interface CalendarPaneToolbarProps {
    scheduleNames: string[];
    currentScheduleIndex: number;
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;

    /**
     * The function in an ancestor component that wraps ScreenshotButton.handleClick
     * to perform canvas transformations before and after downloading the screenshot.
     *
     * TODO, FIXME: don't prop drill, please.
     */
    onTakeScreenshot: (html2CanvasScreenshot: () => void) => void;
}

/**
 * MenuItem nested in a schedule's menu option to edit its settings through a dialog.
 */
function EditScheduleMenuItem(props: { index: number }) {
    const { index } = props;

    const [open, setOpen] = useState(false);

    const handleOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Box>
                <IconButton onClick={handleOpen}>
                    <EditIcon />
                </IconButton>

                <RenameScheduleDialog open={open} index={index} onClose={handleClose} />
                {/* <DeleteScheduleDialog scheduleIndex={index} /> */}
            </Box>
        </>
    );
}

/**
 * MenuItem nested in the select menu to add a new schedule through a dialog.
 */
function AddScheduleMenuItem() {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={handleOpen}>
                <AddIcon />
                <Typography>Add Schedule</Typography>
            </MenuItem>

            {/* This is rendered via a portal, so it's kept outside the MenuItem for clarity. */}
            <AddScheduleDialog open={open} onClose={handleClose} />
        </>
    );
}

function CalendarPaneToolbar(props: CalendarPaneToolbarProps) {
    const { toggleDisplayFinalsSchedule, onTakeScreenshot } = props;

    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const [index, setIndex] = useState(AppStore.getCurrentScheduleIndex());

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const isMobileScreen = useMediaQuery('(max-width:630px)');

    const handleMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const handleToggleFinals = useCallback(() => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
        });
        toggleDisplayFinalsSchedule();
    }, [toggleDisplayFinalsSchedule]);

    const autocompleteOptions = useMemo(() => {
        return scheduleNames.map((name, index) => {
            return {
                label: name,
                value: index,
            };
        });
    }, [scheduleNames]);

    const autocompleteValue = useMemo(() => {
        return {
            label: scheduleNames[index],
            value: index,
        };
    }, [index, scheduleNames]);

    const handleScheduleNamesChange = useCallback(() => {
        setScheduleNames(AppStore.getScheduleNames());
    }, []);

    const handleScheduleIndexChange = useCallback(() => {
        setIndex(AppStore.getCurrentScheduleIndex());
    }, []);

    useEffect(() => {
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

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

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', padding: 1 }}
        >
            <Box gap={1} display="flex" alignItems="center">
                <Autocomplete
                    fullWidth
                    value={autocompleteValue}
                    disableClearable
                    options={autocompleteOptions}
                    onChange={handleScheduleChange}
                    filterOptions={(options, _state) => options}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                        <Box ref={params.InputProps.ref}>
                            <input type="text" {...params.inputProps} />
                        </Box>
                    )}
                    renderOption={(props, option, _state) => (
                        <li key={option.value} style={{ display: 'flex', alignItems: 'center' }}>
                            <Box {...(props as React.HTMLAttributes<HTMLElement>)} whiteSpace="nowrap" width={1}>
                                {option.label}
                            </Box>
                            <Box padding={1}>HI</Box>
                        </li>
                    )}
                />
            </Box>
            {/*
            <Box gap={1} display="flex" alignItems="center">
                <Select
                    value={currentScheduleIndex}
                    onChange={handleScheduleChange}
                    variant="standard"
                    SelectDisplayProps={{}}
                >
                    {scheduleNames.map((name, index) => (
                        <MenuItem key={index} value={index}>
                            <Box display="flex" alignItems="center" width={1}>
                                <Box width={1}>
                                    <Typography>{name}</Typography>
                                </Box>
                                <EditScheduleMenuItem index={index} />
                            </Box>
                        </MenuItem>
                    ))}

                    <AddScheduleMenuItem />

                    <EditScheduleMenuItem index={0} />
                </Select>

                <Tooltip title="Toggle showing finals schedule">
                    <Button
                        onClick={handleToggleFinals}
                        size="small"
                        variant={showFinalsSchedule ? 'contained' : 'outlined'}
                        color={showFinalsSchedule ? 'primary' : 'secondary'}
                    >
                        Finals
                    </Button>
                </Tooltip>
            </Box>
            */}

            <Box flexGrow={1} />

            <Box display="flex" flexWrap="wrap" gap={0.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Tooltip title="Undo last action">
                        <IconButton onClick={handleUndo} size="small">
                            <UndoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Clear schedule">
                        <IconButton onClick={handleClearSchedule} size="small">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {isMobileScreen ? (
                    <Box>
                        <IconButton onClick={handleMenuClick}>
                            <MoreHorizIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose}>
                                <ExportCalendar key="export" />
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose}>
                                <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot" />
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose}>
                                <CustomEventDialog scheduleNames={scheduleNames} key="custom" />
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={0.5}>
                        <ExportCalendar key="export" />
                        <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot" />
                        <CustomEventDialog scheduleNames={scheduleNames} key="custom" />
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

export default CalendarPaneToolbar;

import { useState, useCallback } from 'react';
import {
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    useMediaQuery,
    type SelectProps,
} from '@mui/material';
import { Delete, MoreHoriz, Undo } from '@mui/icons-material';

import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import EditSchedule from './Toolbar/EditSchedule/EditSchedule';
import ScheduleNameDialog from './Toolbar/EditSchedule/ScheduleNameDialog';
import ExportCalendar from './Toolbar/ExportCalendar';
import ScreenshotButton from './Toolbar/ScreenshotButton';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { changeCurrentSchedule, clearSchedules, undoDelete } from '$actions/AppStoreActions';

const handleScheduleChange: SelectProps['onChange'] = (event) => {
    logAnalytics({
        category: analyticsEnum.calendar.title,
        action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
    });
    changeCurrentSchedule(Number(event.target.value));
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

const CalendarPaneToolbar = (props: CalendarPaneToolbarProps) => {
    const { scheduleNames, currentScheduleIndex, showFinalsSchedule, toggleDisplayFinalsSchedule, onTakeScreenshot } =
        props;

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

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', padding: 1 }}
        >
            <Box gap={1} display="flex" alignItems="center">
                <EditSchedule scheduleNames={scheduleNames} scheduleIndex={currentScheduleIndex} />

                <Select value={currentScheduleIndex} onChange={handleScheduleChange} variant="standard">
                    {scheduleNames.map((name, index) => (
                        <MenuItem key={index} value={index}>
                            {name}
                        </MenuItem>
                    ))}
                    <ScheduleNameDialog scheduleNames={scheduleNames} />
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

            <Box flexGrow={1} />

            <Box display="flex" flexWrap="wrap" gap={0.5}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Tooltip title="Undo last action">
                        <IconButton onClick={handleUndo} size="small">
                            <Undo fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Clear schedule">
                        <IconButton onClick={handleClearSchedule} size="small">
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {isMobileScreen ? (
                    <Box>
                        <IconButton onClick={handleMenuClick}>
                            <MoreHoriz />
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
};

export default CalendarPaneToolbar;

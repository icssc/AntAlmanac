import { Add, Edit } from '@mui/icons-material';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    TextField,
    Tooltip,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useState } from 'react';

import { addCustomEvent, editCustomEvent } from '$actions/AppStoreActions';
import { DaySelector } from '$components/Calendar/Toolbar/CustomEventDialog/DaySelector';
import { ScheduleSelector } from '$components/Calendar/Toolbar/CustomEventDialog/ScheduleSelector';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/BuildingSelect';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

interface CustomEventDialogProps {
    customEvent?: RepeatingCustomEvent;
    onDialogClose?: () => void;
    scheduleNames: string[];
}

const defaultCustomEventValues: RepeatingCustomEvent = {
    start: '10:30',
    end: '15:30',
    title: '',
    days: [false, false, false, false, false, false, false],
    customEventID: 0,
    building: undefined,
};

export function CustomEventDialog(props: CustomEventDialogProps) {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [open, setOpen] = useState(false);
    const [scheduleIndices, setScheduleIndices] = useState<number[]>([]);
    const [start, setStart] = useState(props.customEvent?.start ?? defaultCustomEventValues.start);
    const [end, setEnd] = useState(props.customEvent?.end ?? defaultCustomEventValues.end);
    const [title, setTitle] = useState(props.customEvent?.title ?? defaultCustomEventValues.title);
    const [days, setDays] = useState(props.customEvent?.days ?? defaultCustomEventValues.days);
    const [building, setBuilding] = useState<string | undefined>(
        props.customEvent?.building ?? defaultCustomEventValues.building
    );

    const postHog = usePostHog();

    const resetForm = () => {
        setStart(defaultCustomEventValues.start);
        setEnd(defaultCustomEventValues.end);
        setTitle(defaultCustomEventValues.title);
        setDays(defaultCustomEventValues.days);
        setBuilding(undefined);
        setScheduleIndices([]);
    };

    const disabled = !(scheduleIndices.length && days.includes(true));

    const handleSubmit = () => {
        handleClose();
        handleAddToCalendar();

        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
        });
    };

    const handleOpen = useCallback(() => {
        setOpen(true);
        setScheduleIndices(AppStore.schedule.getIndexesOfCustomEvent(props.customEvent?.customEventID ?? -1));

        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.CLICK_CUSTOM_EVENT,
        });
    }, [props.customEvent?.customEventID]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleEventNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }, []);

    const handleStartTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setStart(event.target.value);
    }, []);

    const handleEndTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnd(event.target.value);
    }, []);

    const handleDayChange = useCallback((days: boolean[]) => {
        setDays(days);
    }, []);

    const handleSelectScheduleIndices = useCallback((scheduleIndices: number[]) => {
        setScheduleIndices(scheduleIndices);
    }, []);

    const handleBuildingChange = (building?: ExtendedBuilding | null) => {
        setBuilding(building?.id);
    };

    const handleAddToCalendar = () => {
        if (!days.some((day) => day) || scheduleIndices.length === 0) return;

        const newCustomEvent: RepeatingCustomEvent = {
            color: props.customEvent?.color ?? '#551a8b',
            title: title,
            days: days,
            start: start,
            end: end,
            customEventID: props.customEvent?.customEventID ?? Date.now(),
            building: building,
        };

        resetForm();

        console.log(props.customEvent);

        props.customEvent
            ? editCustomEvent(newCustomEvent, scheduleIndices)
            : addCustomEvent(newCustomEvent, scheduleIndices);
    };

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const isDark = useThemeStore.getState().isDark;

    return (
        <>
            {props.customEvent ? (
                <Tooltip title="Edit">
                    <IconButton onClick={handleOpen}>
                        <Edit fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Custom events" placement="right">
                    <MenuItem onClick={handleOpen} disabled={skeletonMode}>
                        <ListItemIcon>
                            <Add fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Custom Event</ListItemText>
                    </MenuItem>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} maxWidth={'xs'}>
                <DialogTitle id="form-dialog-title">
                    {props.customEvent ? 'Edit a Custom Event' : 'Add a Custom Event'}
                </DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        paddingTop: '12px',
                        minWidth: (theme) => theme.breakpoints.values.xxs,
                    }}
                >
                    <FormControl fullWidth>
                        <TextField
                            label="Event Name"
                            fullWidth
                            value={title}
                            margin="dense"
                            onChange={handleEventNameChange}
                            variant="outlined"
                            InputLabelProps={{ variant: 'outlined' }}
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                        <TextField
                            onChange={handleStartTimeChange}
                            label="Start Time"
                            type="time"
                            defaultValue={start}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ variant: 'outlined' }}
                        />
                        <TextField
                            onChange={handleEndTimeChange}
                            label="End Time"
                            type="time"
                            defaultValue={end}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ variant: 'outlined' }}
                        />
                    </FormControl>
                    <DaySelector onSelectDay={handleDayChange} days={days} />
                    <BuildingSelect value={building} onChange={handleBuildingChange} variant="outlined" />
                    <ScheduleSelector
                        scheduleIndices={scheduleIndices}
                        onSelectScheduleIndices={handleSelectScheduleIndices}
                        scheduleNames={props.scheduleNames}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={disabled}>
                        {disabled ? 'Specify schedule and day' : props.customEvent ? 'Save Changes' : 'Add Event'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

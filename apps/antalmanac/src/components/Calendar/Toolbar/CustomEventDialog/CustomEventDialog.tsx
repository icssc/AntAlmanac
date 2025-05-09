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
} from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';

import DaySelector from './DaySelector';
import ScheduleSelector from './ScheduleSelector';

import { addCustomEvent, editCustomEvent } from '$actions/AppStoreActions';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/building-select';
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

function CustomEventDialogs(props: CustomEventDialogProps) {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [open, setOpen] = useState(false);
    const [scheduleIndices, setScheduleIndices] = useState<number[]>([]);
    const [start, setStart] = useState(defaultCustomEventValues.start);
    const [end, setEnd] = useState(defaultCustomEventValues.end);
    const [title, setTitle] = useState(defaultCustomEventValues.title);
    const [days, setDays] = useState(defaultCustomEventValues.days);
    const [building, setBuilding] = useState<string | undefined>();

    const resetForm = () => {
        setStart(defaultCustomEventValues.start);
        setEnd(defaultCustomEventValues.end);
        setTitle(defaultCustomEventValues.title);
        setDays(defaultCustomEventValues.days);
        setBuilding(undefined);
    };

    const disabled = !(scheduleIndices.length && days.includes(true));

    const handleSubmit = () => {
        handleClose();
        handleAddToCalendar();

        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
        });
    };

    const handleOpen = useCallback(() => {
        setOpen(true);
        setScheduleIndices([AppStore.schedule.getCurrentScheduleIndex()]);

        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CLICK_CUSTOM_EVENT,
        });
    }, []);

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
            color: props.customEvent ? props.customEvent.color : '#551a8b',
            title: title,
            days: days,
            start: start,
            end: end,
            customEventID: props.customEvent ? props.customEvent.customEventID : Date.now(),
            building: building,
        };

        resetForm();

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
                    <IconButton
                        onClick={() => {
                            handleOpen();
                            // Typecasting prevents TypeScript possibly undefined compile error
                            const customEvent = props.customEvent as RepeatingCustomEvent;
                            setScheduleIndices(AppStore.schedule.getIndexesOfCustomEvent(customEvent.customEventID));
                            setStart(customEvent.start);
                            setEnd(customEvent.end);
                            setTitle(customEvent.title);
                            setDays(customEvent.days);
                            setBuilding(customEvent.building);
                        }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Add custom events">
                    <IconButton onClick={handleOpen} size="medium" disabled={skeletonMode}>
                        <Add fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} maxWidth={'xs'}>
                <DialogTitle id="form-dialog-title">
                    {props.customEvent ? 'Edit a Custom Event' : 'Add a Custom Event'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <FormControl fullWidth>
                        <TextField
                            id="event-name-input"
                            label="Event Name"
                            variant="outlined"
                            required={true}
                            value={title}
                            onChange={handleEventNameChange}
                            margin="dense"
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
                        <TextField
                            onChange={handleStartTimeChange}
                            label="Start Time"
                            type="time"
                            defaultValue={start}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                        <TextField
                            onChange={handleEndTimeChange}
                            label="End Time"
                            type="time"
                            defaultValue={end}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                    </FormControl>
                    <DaySelector onSelectDay={handleDayChange} days={props.customEvent?.days} />
                    <BuildingSelect value={building} onChange={handleBuildingChange} variant="outlined" />
                    <ScheduleSelector
                        scheduleIndices={scheduleIndices}
                        onSelectScheduleIndices={handleSelectScheduleIndices}
                        customEvent={props.customEvent}
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
export default CustomEventDialogs;

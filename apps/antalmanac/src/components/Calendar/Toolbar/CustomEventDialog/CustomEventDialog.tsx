import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    IconButton,
    Input,
    InputLabel,
    TextField,
    Tooltip,
} from '@material-ui/core';
import { Add, Edit } from '@mui/icons-material';
import React, { useCallback, useEffect, useState } from 'react';

import DaySelector from './DaySelector';
import ScheduleSelector from './ScheduleSelector';
import { addCustomEvent, editCustomEvent } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different. This one encapsulates the occurences of an event on multiple days, like Monday Tuesday Wednesday all in the same object as specified by the days array. The other one, `CustomEventDialog`'s CustomEvent, represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F
 * TODO: This needs to be moved to course_data.types.ts. It's stupid that components need to import from here instead of $lib
 */
export interface RepeatingCustomEvent {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    customEventID: number;
    color?: string;
}

interface CustomEventDialogProps {
    customEvent?: RepeatingCustomEvent;
    onDialogClose?: () => void;
}

const defaultCustomEventValues: RepeatingCustomEvent = {
    start: '10:30',
    end: '15:30',
    title: '',
    days: [false, false, false, false, false, false, false],
    customEventID: 0,
};

function CustomEventDialogs(props: CustomEventDialogProps) {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [open, setOpen] = useState(false);
    const [scheduleIndices, setScheduleIndices] = useState<number[]>([]);
    const [start, setStart] = useState(defaultCustomEventValues.start);
    const [end, setEnd] = useState(defaultCustomEventValues.end);
    const [title, setTitle] = useState(defaultCustomEventValues.title);
    const [days, setDays] = useState(defaultCustomEventValues.days);

    const resetForm = () => {
        setStart(defaultCustomEventValues.start);
        setEnd(defaultCustomEventValues.end);
        setTitle(defaultCustomEventValues.title);
        setDays(defaultCustomEventValues.days);
    };

    const disabled = !(scheduleIndices.length && days.includes(true));

    const handleAddToCalendar = () => {
        if (disabled) return;

        const newCustomEvent = {
            color: props.customEvent ? props.customEvent.color : '#551a8b',
            title: title,
            days: days,
            start: start,
            end: end,
            customEventID: props.customEvent ? props.customEvent.customEventID : Date.now(),
        };

        resetForm();

        props.customEvent
            ? editCustomEvent(newCustomEvent, scheduleIndices)
            : addCustomEvent(newCustomEvent, scheduleIndices);
    };

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

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return (
        <>
            {props.customEvent ? (
                <IconButton
                    onClick={() => {
                        handleOpen();

                        // Typecasting gets rid of a TypeScript possibly undefined compile error
                        const customEvent = props.customEvent as RepeatingCustomEvent;
                        setScheduleIndices(AppStore.schedule.getIndexesOfCustomEvent(customEvent.customEventID));
                        setStart(customEvent.start);
                        setEnd(customEvent.end);
                        setTitle(customEvent.title);
                        setDays(customEvent.days);
                    }}
                >
                    <Edit fontSize="small" />
                </IconButton>
            ) : (
                <Tooltip title="Add custom events">
                    <Button
                        disableRipple={true}
                        onClick={handleOpen}
                        variant="outlined"
                        size="small"
                        startIcon={<Add fontSize="small" />}
                        disabled={skeletonMode}
                    >
                        Custom
                    </Button>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} maxWidth={'lg'}>
                <DialogContent>
                    <FormControl>
                        <InputLabel htmlFor="EventNameInput">Event Name</InputLabel>
                        <Input required={true} value={title} onChange={handleEventNameChange} />
                    </FormControl>
                    <form noValidate style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                        <TextField
                            onChange={handleStartTimeChange}
                            label="Start Time"
                            type="time"
                            defaultValue={start}
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
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300,
                            }}
                        />
                    </form>
                    <DaySelector onSelectDay={handleDayChange} days={props.customEvent?.days || days} />
                    <ScheduleSelector
                        scheduleIndices={scheduleIndices}
                        onSelectScheduleIndices={handleSelectScheduleIndices}
                        customEvent={props.customEvent}
                        scheduleNames={AppStore.getScheduleNames()}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => handleClose()} color={isDarkMode() ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={() => handleSubmit()} variant="contained" color="primary" disabled={disabled}>
                        {disabled
                            ? 'Schedule and day must be checked'
                            : props.customEvent
                            ? 'Save Changes'
                            : 'Add Event'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default CustomEventDialogs;

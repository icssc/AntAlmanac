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
    scheduleNames: string[];
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

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const handleOpen = useCallback(() => {
        setOpen(true);
        setScheduleIndices([AppStore.schedule.getCurrentScheduleIndex()]);

        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CLICK_CUSTOM_EVENT,
        });
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const handleSubmit = () => {
        handleClose();
        handleAddToCalendar();

        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
        });
    };

    const resetForm = () => {
        setStart(defaultCustomEventValues.start);
        setEnd(defaultCustomEventValues.end);
        setTitle(defaultCustomEventValues.title);
        setDays(defaultCustomEventValues.days);
    };

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

    const handleEventNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        (event) => {
            setTitle(event.target.value);
        },
        [setTitle]
    );

    const handleStartTimeChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        (event) => {
            setStart(event.target.value);
        },
        [setStart]
    );

    const handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        (event) => {
            setEnd(event.target.value);
        },
        [setEnd]
    );

    const handleDayChange = useCallback(
        (days: boolean[]) => {
            setDays(days);
        },
        [setDays]
    );

    const handleSelectScheduleIndices = useCallback(
        (scheduleIndices: number[]) => {
            setScheduleIndices(scheduleIndices);
        },
        [setScheduleIndices]
    );

    const disabled = !(scheduleIndices.length && days.includes(true));

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
                    <form noValidate>
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
                            style={{ marginRight: 5, marginTop: 5 }}
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
                            style={{ marginRight: 5, marginTop: 5 }}
                        />
                    </form>
                    <DaySelector onSelectDay={handleDayChange} days={props.customEvent?.days || days} />
                    <ScheduleSelector
                        scheduleIndices={scheduleIndices}
                        onSelectScheduleIndices={handleSelectScheduleIndices}
                        customEvent={props.customEvent}
                        scheduleNames={props.scheduleNames}
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

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
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useState } from 'react';

import { addCustomEvent, editCustomEvent } from '$actions/AppStoreActions';
import { DaySelector } from '$components/Calendar/Toolbar/CustomEventDialog/DaySelector';
import { ScheduleSelector } from '$components/Calendar/Toolbar/CustomEventDialog/ScheduleSelector';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/BuildingSelect';
import { useIsReadonlyView } from '$hooks/useIsReadonlyView';
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

    const isReadonlyView = useIsReadonlyView();

    const resetForm = () => {
        setStart(defaultCustomEventValues.start);
        setEnd(defaultCustomEventValues.end);
        setTitle(defaultCustomEventValues.title);
        setDays(defaultCustomEventValues.days);
        setBuilding(undefined);
        setScheduleIndices([]);
    };

    const disableSubmit = !(scheduleIndices.length && days.includes(true));

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
        if (props.customEvent) {
            const customEventId = Number(props.customEvent.customEventID);
            setScheduleIndices(AppStore.schedule.getIndexesOfCustomEvent(customEventId));
        } else {
            setScheduleIndices([AppStore.getCurrentScheduleIndex()]);
        }

        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.CLICK_CUSTOM_EVENT,
        });
    }, [props.customEvent, postHog]);

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

    const disableButton = isReadonlyView || skeletonMode;

    return (
        <>
            {props.customEvent ? (
                <Tooltip title="Edit">
                    <span>
                        <IconButton onClick={handleOpen} disabled={disableButton}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            ) : (
                <Tooltip title="Add custom events">
                    <span>
                        <IconButton onClick={handleOpen} size="medium" disabled={disableButton}>
                            <Add fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            <Dialog open={open} onClose={handleClose} maxWidth={'xs'}>
                <DialogTitle id="form-dialog-title">
                    {props.customEvent ? 'Edit a Custom Event' : 'Add a Custom Event'}
                </DialogTitle>
                <DialogContent
                    sx={(theme) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        paddingTop: '12px',
                        minWidth: { sm: theme.breakpoints.values.xxs },
                    })}
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
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={disableSubmit}>
                        {disableSubmit ? 'Specify schedule and day' : props.customEvent ? 'Save Changes' : 'Add Event'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

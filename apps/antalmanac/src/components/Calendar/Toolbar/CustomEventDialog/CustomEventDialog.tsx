import React, { PureComponent } from 'react';
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
import { withStyles } from '@material-ui/core/styles';
import { Add, Edit } from '@material-ui/icons';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';

import DaySelector from './DaySelector';
import ScheduleSelector from './ScheduleSelector';
import { addCustomEvent, editCustomEvent } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { useThemeStore } from '$stores/SettingsStore';
import AppStore from '$stores/AppStore';
import { BuildingSelect, ExtendedBuilding } from '$components/inputs/building-select';

export { RepeatingCustomEvent };

const styles = {
    textField: {
        minWidth: 120,
    },
};

interface CustomEventDialogProps {
    customEvent?: RepeatingCustomEvent;
    onDialogClose?: () => void;
    scheduleNames: string[];
}

interface CustomEventDialogState extends RepeatingCustomEvent {
    open: boolean;
    scheduleIndices: number[];
}

const defaultCustomEvent: RepeatingCustomEvent = {
    start: '10:30',
    end: '15:30',
    title: '',
    days: [false, false, false, false, false, false, false],
    customEventID: 0,
    building: undefined,
};

class CustomEventDialog extends PureComponent<CustomEventDialogProps, CustomEventDialogState> {
    state: CustomEventDialogState = {
        open: false,
        ...(this.props.customEvent || defaultCustomEvent),
        scheduleIndices: [],
    };

    handleOpen = () => {
        this.setState({ open: true, scheduleIndices: [AppStore.schedule.getCurrentScheduleIndex()] });

        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CLICK_CUSTOM_EVENT,
        });
    };

    handleClose = (cancel: boolean) => {
        if (!cancel) {
            logAnalytics({
                category: analyticsEnum.calendar.title,
                action: analyticsEnum.calendar.actions.ADD_CUSTOM_EVENT,
            });
            if (this.props.onDialogClose) this.props.onDialogClose();
            this.handleAddToCalendar();
        }

        this.setState({
            ...this.state,
            open: false,
        });
    };

    handleEventNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        this.setState({ title: event.target.value });
    };

    handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        this.setState({ end: event.target.value });
    };

    handleStartTimeChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        this.setState({ start: event.target.value });
    };

    handleDayChange = (days: boolean[]) => {
        this.setState({ days: days });
    };

    handleBuildingChange = (building?: ExtendedBuilding | null) => {
        this.setState({ building: building?.id });
    };

    handleAddToCalendar = () => {
        if (!this.state.days.some((day) => day) || this.state.scheduleIndices.length === 0) return;

        const newCustomEvent: RepeatingCustomEvent = {
            color: this.props.customEvent ? this.props.customEvent.color : '#551a8b',
            title: this.state.title,
            days: this.state.days,
            start: this.state.start,
            end: this.state.end,
            customEventID: this.props.customEvent ? this.props.customEvent.customEventID : Date.now(),
            building: this.state.building,
        };

        if (this.props.customEvent) editCustomEvent(newCustomEvent, this.state.scheduleIndices);
        else addCustomEvent(newCustomEvent, this.state.scheduleIndices);
    };

    handleSelectScheduleIndices = (scheduleIndices: number[]) => {
        this.setState({ scheduleIndices: scheduleIndices });
    };

    isAddDisabled = () => {
        return !(this.state.scheduleIndices.length && this.state.days.some(Boolean));
    };

    render() {
        const appTheme = useThemeStore.getState().appTheme;
        return (
            <>
                {this.props.customEvent !== undefined ? (
                    // Dumb ternary below added to get rid of TypeScript possibly undefined compile error
                    <IconButton
                        onClick={() =>
                            this.setState({
                                open: true,
                                scheduleIndices: AppStore.schedule.getIndexesOfCustomEvent(
                                    this.props.customEvent ? this.props.customEvent.customEventID : 0
                                ),
                            })
                        }
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                ) : (
                    <Tooltip title="Add custom events">
                        <Button
                            disableRipple={true}
                            onClick={this.handleOpen}
                            variant="outlined"
                            size="small"
                            startIcon={<Add fontSize="small" />}
                        >
                            Custom
                        </Button>
                    </Tooltip>
                )}
                <Dialog open={this.state.open} onClose={this.handleClose} maxWidth={'lg'}>
                    <DialogContent>
                        <FormControl>
                            <InputLabel htmlFor="EventNameInput">Event Name</InputLabel>
                            <Input required={true} value={this.state.title} onChange={this.handleEventNameChange} />
                        </FormControl>
                        <form noValidate>
                            <TextField
                                onChange={this.handleStartTimeChange}
                                label="Start Time"
                                type="time"
                                defaultValue={this.state.start}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300,
                                }}
                                style={{ marginRight: 5, marginTop: 5 }}
                            />
                            <TextField
                                onChange={this.handleEndTimeChange}
                                label="End Time"
                                type="time"
                                defaultValue={this.state.end}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300,
                                }}
                                style={{ marginRight: 5, marginTop: 5 }}
                            />
                        </form>
                        <DaySelector onSelectDay={this.handleDayChange} days={this.props.customEvent?.days} />
                        <BuildingSelect value={this.state.building} onChange={this.handleBuildingChange} />
                        <ScheduleSelector
                            scheduleIndices={this.state.scheduleIndices}
                            onSelectScheduleIndices={this.handleSelectScheduleIndices}
                            customEvent={this.props.customEvent}
                            scheduleNames={this.props.scheduleNames}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => this.handleClose(true)}
                            color={appTheme == 'dark' ? 'secondary' : 'primary'}
                        >
                            Cancel
                        </Button>
                        <Tooltip title="Schedule and day must be checked" disableHoverListener={!this.isAddDisabled()}>
                            <span>
                                <Button
                                    onClick={() => this.handleClose(false)}
                                    variant="contained"
                                    color="primary"
                                    disabled={this.isAddDisabled()}
                                >
                                    {this.props.customEvent ? 'Save Changes' : 'Add Event'}
                                </Button>
                            </span>
                        </Tooltip>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default withStyles(styles)(CustomEventDialog);

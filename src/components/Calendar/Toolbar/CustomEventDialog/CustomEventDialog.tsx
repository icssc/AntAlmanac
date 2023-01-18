import React, { PureComponent } from 'react';
import DaySelector from './DaySelector';
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
import { addCustomEvent, editCustomEvent } from '../../../../actions/AppStoreActions';
import ScheduleSelector from './ScheduleSelector';
import ReactGA from 'react-ga';
import analyticsEnum, { logAnalytics } from '../../../../analytics';
import { isDarkMode } from '../../../../helpers';

const styles = {
    textField: {
        minWidth: 120,
    },
};

/**
 * There is another CustomEvent interface in CourseCalendarEvent and they are slightly different. This one encapsulates the occurences of an event on multiple days, like Monday Tuesday Wednesday all in the same object as specified by the days array. The other one, `CustomEventDialog`'s CustomEvent, represents only one day, like the event on Monday, and needs to be duplicated to be repeated across multiple days.
 * https://github.com/icssc/AntAlmanac/wiki/The-Great-AntAlmanac-TypeScript-Rewritening%E2%84%A2#duplicate-interface-names-%EF%B8%8F
 */
export interface RepeatingCustomEvent {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    scheduleIndices: number[];
    customEventID: number;
    color?: string;
}

interface CustomEventDialogProps {
    customEvent?: RepeatingCustomEvent;
    onDialogClose?: () => void;
    currentScheduleIndex: number;
    scheduleNames: string[];
}

interface CustomEventDialogState extends RepeatingCustomEvent {
    open: boolean;
}

const defaultCustomEvent: RepeatingCustomEvent = {
    start: '10:30',
    end: '15:30',
    title: '',
    days: [false, false, false, false, false, false, false],
    scheduleIndices: [],
    customEventID: 0,
};

class CustomEventDialog extends PureComponent<CustomEventDialogProps, CustomEventDialogState> {
    state: CustomEventDialogState = {
        open: false,
        ...(this.props.customEvent || defaultCustomEvent),
    };

    handleOpen = () => {
        this.setState({ open: true, scheduleIndices: [this.props.currentScheduleIndex] });
        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Click Custom Event button',
        });
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

    handleAddToCalendar = () => {
        if (!this.state.days.some((day) => day) || this.state.scheduleIndices.length === 0) return;

        const newCustomEvent = {
            color: this.props.customEvent ? this.props.customEvent.color : '#551a8b',
            title: this.state.title,
            days: this.state.days,
            scheduleIndices: this.state.scheduleIndices,
            start: this.state.start,
            end: this.state.end,
            customEventID: this.props.customEvent ? this.props.customEvent.customEventID : Date.now(),
        };

        if (this.props.customEvent) editCustomEvent(newCustomEvent);
        else addCustomEvent(newCustomEvent);
    };

    handleSelectScheduleIndices = (scheduleIndices: number[]) => {
        this.setState({ scheduleIndices: scheduleIndices });
    };

    isAddDisabled = () => {
        return !(this.state.scheduleIndices.length && this.state.days.some(Boolean));
    };

    render() {
        return (
            <>
                {this.props.customEvent ? (
                    <IconButton onClick={() => this.setState({ open: true })}>
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
                            Add Custom
                        </Button>
                    </Tooltip>
                )}
                <Dialog open={this.state.open} maxWidth={'lg'}>
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
                        <ScheduleSelector
                            scheduleIndices={this.state.scheduleIndices}
                            onSelectScheduleIndices={this.handleSelectScheduleIndices}
                            customEvent={this.props.customEvent}
                            scheduleNames={this.props.scheduleNames}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => this.handleClose(true)} color={isDarkMode() ? 'secondary' : 'primary'}>
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

import React, { Fragment, PureComponent } from 'react';
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
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Add, Edit, GetApp } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { addCustomEvent, editCustomEvent } from '../../actions/AppStoreActions';
import ScheduleSelector from './ScheduleSelector';

const styles = () => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        minWidth: 120,
    },
});

class CustomEventDialog extends PureComponent {
    state = {
        open: false,
        start: this.props.customEvent ? this.props.customEvent.start : '10:30',
        end: this.props.customEvent ? this.props.customEvent.end : '15:30',
        eventName: this.props.customEvent ? this.props.customEvent.title : '',
        days: this.props.customEvent
            ? this.props.customEvent.days
            : [false, false, false, false, false],
        scheduleIndices: this.props.customEvent
            ? this.props.customEvent.scheduleIndices
            : [],
        customEventID: this.props.customEvent
            ? this.props.customEvent.customEventID
            : 0,
    };

    handleClose = (cancel) => {
        if (!cancel)
            this.handleAddToCalendar();

        this.setState({ open: false });
    };

    handleEventNameChange = (event) => {
        this.setState({ eventName: event.target.value });
    };

    handleEndTimeChange = (event) => {
        this.setState({ end: event.target.value });
    };

    handleStartTimeChange = (event) => {
        this.setState({ start: event.target.value });
    };

    handleDayChange = (days) => {
        this.setState({ days: days });
    };

    handleAddToCalendar = () => {
        if (!this.state.days.some((day) => day)) return;

        const newCustomEvent = {
            color: this.props.customEvent
                ? this.props.customEvent.color
                : '#551a8b',
            title: this.state.eventName,
            days: this.state.days,
            scheduleIndices: this.state.scheduleIndices,
            start: this.state.start,
            end: this.state.end,
            customEventID: this.props.customEvent
                ? this.props.customEvent.customEventID
                : Date.now(),
        };

        if (this.props.customEvent) editCustomEvent(newCustomEvent);
        else addCustomEvent(newCustomEvent);
    };

    handleSelectScheduleIndices = (scheduleIndices) => {
        this.setState({ scheduleIndices: scheduleIndices });
    };

    render() {
        return (
            <Fragment>
                {this.props.customEvent ? (
                    <IconButton onClick={() => this.setState({ open: true })}>
                        <Edit fontSize="small" />
                    </IconButton>
                ) : (
                    <Button
                        disableRipple={true}
                        onClick={() => this.setState({ open: true })}
                        variant="outlined"
                        size="small"
                        style={{ marginRight: 8 }}
                    >
                        <Add fontSize="small" /> Add Custom
                    </Button>
                )}
                <Dialog open={this.state.open}>
                    <DialogContent>
                        <FormControl>
                            <InputLabel htmlFor="EventNameInput">
                                Event Name
                            </InputLabel>
                            <Input
                                required={true}
                                value={this.state.eventName}
                                onChange={this.handleEventNameChange}
                            />
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
                        <DaySelector
                            days={this.state.days}
                            onSelectDay={this.handleDayChange}
                            customEvent={this.props.customEvent}
                        />
                        <ScheduleSelector
                            scheduleIndices={this.state.scheduleIndices}
                            onSelectScheduleIndices={
                                this.handleSelectScheduleIndices
                            }
                            customEvent={this.props.customEvent}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => this.handleClose(true)}
                            color="primary"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => this.handleClose(false)}
                            variant="contained"
                            color="primary"
                        >
                            {this.props.customEvent
                                ? 'Save Changes'
                                : 'Add Event'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

CustomEventDialog.propTypes = {
    customEvent: PropTypes.object,
};

export default withStyles(styles)(CustomEventDialog);

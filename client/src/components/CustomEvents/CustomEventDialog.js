import React, { Fragment, PureComponent } from 'react';
import DaySelector from './DaySelector';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    Input,
    InputLabel,
    TextField,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Add, Create } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { addCustomEvent } from '../../actions/AppStoreActions';
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
        days: [false, false, false, false, false],
        scheduleIndices: [],
        customEventID: this.props.customEvent
            ? this.props.customEvent.customEventID
            : 0,
    };

    handleClose = (cancel) => {
        if (!cancel) this.handleAddToCalendar();
        if (!this.props.customEvent) this.props.handleSubmenuClose();
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

        const customEvent = {
            color: this.props.customEvent
                ? this.props.customEvent.color
                : '#551a8b',
            title: this.state.eventName,
            days: this.state.days,
            scheduleIndices: this.props.customEvent
                ? this.props.customEvent.scheduleIndices
                : this.state.scheduleIndices,
            start: this.state.start,
            end: this.state.end,
            customEventID: this.props.customEvent
                ? this.props.customEvent.customEventID
                : Date.now(),
        };

        if (this.props.customEvent)
            this.props.onEditCustomEvent(this.props.customEvent);
        else addCustomEvent(customEvent);
    };

    handleSelectScheduleIndices = (scheduleIndices) => {
        this.setState({ scheduleIndices: scheduleIndices });
    };

    render() {
        return (
            <Fragment>
                <Button
                    disableRipple={true}
                    onClick={() => this.setState({ open: true })}
                >
                    {this.props.customEvent ? (
                        <Create />
                    ) : (
                        <Fragment>
                            <Add /> Add Custom
                        </Fragment>
                    )}
                </Button>
                <Dialog
                    open={this.state.open}
                    onClose={() => this.setState({ open: false })}
                >
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
    handleSubmenuClose: PropTypes.func,
};

export default withStyles(styles)(CustomEventDialog);

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
    Tooltip,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Add, Edit } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { addCustomEvent, editCustomEvent } from '../../actions/AppStoreActions';
import ScheduleSelector from './ScheduleSelector';
import ReactGA from 'react-ga';

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
        days: this.props.customEvent ? this.props.customEvent.days : [false, false, false, false, false],
        scheduleIndices: this.props.customEvent ? this.props.customEvent.scheduleIndices : [],
        customEventID: this.props.customEvent ? this.props.customEvent.customEventID : 0,
    };

    handleOpen = () => {
        this.setState({ open: true });
        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Click Custom Event button',
        });
    };

    handleClose = (cancel) => {
        if (!cancel) {
            if (this.props.onDialogClose) this.props.onDialogClose();
            this.handleAddToCalendar();
        }

        this.setState({ open: false, eventName: '', days: [false, false, false, false, false], scheduleIndices: [] });
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
        if (!this.state.days.some((day) => day) || this.state.scheduleIndices.length === 0) return;

        const newCustomEvent = {
            color: this.props.customEvent ? this.props.customEvent.color : '#551a8b',
            title: this.state.eventName,
            days: this.state.days,
            scheduleIndices: this.state.scheduleIndices,
            start: this.state.start,
            end: this.state.end,
            customEventID: this.props.customEvent ? this.props.customEvent.customEventID : Date.now(),
        };

        if (this.props.customEvent) editCustomEvent(newCustomEvent);
        else addCustomEvent(newCustomEvent);
    };

    handleSelectScheduleIndices = (scheduleIndices) => {
        this.setState({ scheduleIndices: scheduleIndices });
    };

    isAddDisabled = () => {
        return !(this.state.scheduleIndices.length && this.state.days.some(Boolean));
    };

    render() {
        return (
            <Fragment>
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
                <Dialog open={this.state.open}>
                    <DialogContent>
                        <FormControl>
                            <InputLabel htmlFor="EventNameInput">Event Name</InputLabel>
                            <Input required={true} value={this.state.eventName} onChange={this.handleEventNameChange} />
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
                            onSelectScheduleIndices={this.handleSelectScheduleIndices}
                            customEvent={this.props.customEvent}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => this.handleClose(true)} color="primary">
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
            </Fragment>
        );
    }
}

CustomEventDialog.propTypes = {
    customEvent: PropTypes.object,
    onDialogClose: PropTypes.func,
};

export default withStyles(styles)(CustomEventDialog);

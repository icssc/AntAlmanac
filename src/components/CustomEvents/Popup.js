import React from 'react';
import DaySelector from "./DaySelector";
import TimePickers from "./DropdownMenu";
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AddIcon from '@material-ui/icons/Add';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import {Add} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton/IconButton";

function EventName(props) {
    return (
        <FormControl>
            <InputLabel
                htmlFor="EventNameInput">
                Event Name
            </InputLabel>
            <Input
                required={true}
                onChange={props.userEventName}
                id="EventNameInput"
            />
        </FormControl>
    );
}

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    }
});

function dayToNum(day) {
    switch (day) {
        case "monday":
            return 1;
        case "tuesday":
            return 2;
        case "wednesday":
            return 3;
        case "thursday":
            return 4;
        case "friday":
            return 5;
    }
}

class DialogSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            start: '07:00',
            end: '08:00',
            eventName: 'Untitled',
            days: {monday: false, tuesday: false, wednesday: false, thursday: false, friday: false},
            anchorEl: null
        };
        this.handleAddEventButtonClicked = this.handleAddEventButtonClicked.bind(this);
    }

    handleClose = (calendarIndex) => {
        if (calendarIndex !== -1) {
            this.handleAddToCalendar(calendarIndex);

        }
        this.setState({
            open: false,
            start: '07:00',
            end: '08:00',
            eventName: 'Untitled',
            days: {monday: false, tuesday: false, wednesday: false, thursday: false, friday: false},
            anchorEl: null
        });
    };

    handleEventNameChange = (event) => {
        this.setState({eventName: event.target.value});
    };

    handleEndTimeChange = (event) => {
        this.setState({end: event.target.value});
    };

    handleStartTimeChange = (event) => {
        this.setState({start: event.target.value});
    };

    handleDayChange = (days) => {
        this.setState({days: days});
    };

    handleAddToCalendar = (calendarIndex) => {
        const startHour = parseInt(this.state.start.slice(0, 2));
        const startMin = parseInt(this.state.start.slice(3, 5));
        const endHour = parseInt(this.state.end.slice(0, 2));
        const endMin = parseInt(this.state.end.slice(3, 5));

        const events = [];

        Object.keys(this.state.days).forEach((day) => {
            if (this.state.days[day]) {
                events.push({
                    color: '#551a8b',
                    title: this.state.eventName,
                    start: new Date(2018, 0, dayToNum(day), startHour, startMin),
                    end: new Date(2018, 0, dayToNum(day), endHour, endMin)
                })
            }
        });

        this.props.onAddCustomEvent(events, calendarIndex);
    };

    handleAddEventButtonClicked(event) {
        this.setState({anchorEl: event.currentTarget});
    }

    render() {
        const {anchorEl} = this.state;

        return (
            <div>
                <IconButton onClick={() => this.setState({open: true})}><Add/></IconButton>
                <Dialog
                    disableBackdropClick
                    disableEscapeKeyDown
                    open={this.state.open}>

                    <DialogContent>
                        <EventName value={this.state.eventName} userEventName={this.handleEventNameChange}/>
                        <TimePickers label="Start Time" onTimeChange={this.handleStartTimeChange}/>
                        <TimePickers label="End Time" onTimeChange={this.handleEndTimeChange}/>
                        <DaySelector onSelectDay={this.handleDayChange}/>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => this.handleClose(-1)} color="primary">
                            Cancel
                        </Button>

                        <Button
                            onClick={this.handleAddEventButtonClicked}
                            variant="contained"
                            color="primary"> Add Event</Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this.setState({anchorEl: null})}>

                            <MenuItem value={4} onClick={() => this.handleClose(4)}>All Schedules</MenuItem>
                            <MenuItem value={0} onClick={() => this.handleClose(0)}>Schedule 1</MenuItem>
                            <MenuItem value={1} onClick={() => this.handleClose(1)}>Schedule 2</MenuItem>
                            <MenuItem value={2} onClick={() => this.handleClose(2)}>Schedule 3</MenuItem>
                            <MenuItem value={3} onClick={() => this.handleClose(3)}>Schedule 4</MenuItem>
                        </Menu>

                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withStyles(styles)(DialogSelect);

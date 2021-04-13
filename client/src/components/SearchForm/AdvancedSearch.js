import React, { PureComponent, Fragment } from 'react';
import {
    MenuItem,
    Select,
    TextField,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Typography,
    Collapse,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../stores/RightPaneStore';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { updateFormValue } from '../../actions/RightPaneActions';

const styles = {
    units: {
        width: '80px',
    },
    timePicker: {
        width: '130px',
    },
    smallTextFields: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
};

class AdvancedSearchTextFields extends PureComponent {
    state = {
        instructor: RightPaneStore.getFormData().instructor,
        units: RightPaneStore.getFormData().units,
        endTime: RightPaneStore.getFormData().endTime,
        startTime: RightPaneStore.getFormData().startTime,
        coursesFull: RightPaneStore.getFormData().coursesFull,
        building: RightPaneStore.getFormData().building,
        room: RightPaneStore.getFormData().room,
    };

    handleChange = (name) => (event) => {
        if (name === 'endTime' || name === 'startTime') {
            if (event !== '') {
                this.setState(
                    {
                        [name]: event.target.value,
                    },
                    () => {
                        updateFormValue('startTime', this.state.startTime);
                        updateFormValue('endTime', this.state.endTime);
                    }
                );
            } else {
                this.setState({ [name]: '' }, () => {
                    updateFormValue('startTime', '');
                    updateFormValue('endTime', '');
                });
            }
        } else if (name === 'online') {
            if (event.target.checked) {
                this.setState({ building: 'ON', room: 'LINE' });
                updateFormValue('building', 'ON');
                updateFormValue('room', 'LINE');
            } else {
                this.setState({ building: '', room: '' });
                updateFormValue('building', '');
                updateFormValue('room', '');
            }
        } else {
            this.setState({ [name]: event.target.value });
            updateFormValue(name, event.target.value);
        }
    };

    /**
     * UPDATE (6-28-19): Transfered course code and course number search boxes to
     * separate classes.
     */
    render() {
        const { classes } = this.props;

        // Build arrays of MenuItem elements for time selection
        const startsAfterMenuItems = [];
        const endsBeforeMenuItems = [];

        startsAfterMenuItems.push(
            <MenuItem key="starts-after-none-item" value="">
                <em>None</em>
            </MenuItem>
        );
        endsBeforeMenuItems.push(
            <MenuItem key="ends-before-none-item" value="">
                <em>None</em>
            </MenuItem>
        );

        startsAfterMenuItems.push(
            <MenuItem key="starts-after-1am-item" value="1:00am">
                1:00am
            </MenuItem>
        );
        for (let hour = 2; hour <= 11; hour++) {
            startsAfterMenuItems.push(
                <MenuItem key={`starts-after-${hour}am-item`} value={`${hour}:00am`}>
                    {hour}:00am
                </MenuItem>
            );
            endsBeforeMenuItems.push(
                <MenuItem key={`ends-before-${hour}am-item`} value={`${hour}:00am`}>
                    {hour}:00am
                </MenuItem>
            );
        }
        startsAfterMenuItems.push(
            <MenuItem key="starts-after-12pm-item" value="12:00pm">
                12:00pm
            </MenuItem>
        );
        endsBeforeMenuItems.push(
            <MenuItem key="ends-before-12pm-item" value="12:00pm">
                12:00pm
            </MenuItem>
        );
        for (let hour = 1; hour <= 11; hour++) {
            startsAfterMenuItems.push(
                <MenuItem key={`starts-after-${hour}pm-item`} value={`${hour} + :00pm`}>
                    {hour}:00pm
                </MenuItem>
            );
            endsBeforeMenuItems.push(
                <MenuItem key={`ends-before-${hour}pm-item`} value={`${hour} + :00pm`}>
                    {hour}:00pm
                </MenuItem>
            );
        }

        return (
            <div className={classes.smallTextFields}>
                <TextField
                    label="Instructor"
                    type="search"
                    value={this.state.instructor}
                    onChange={this.handleChange('instructor')}
                    helperText="Last name only"
                />

                <TextField
                    id="units"
                    label="Units"
                    value={this.state.units}
                    onChange={this.handleChange('units')}
                    type="number"
                    helperText="ex. 3, 4, 1.7"
                    className={classes.units}
                />

                <FormControl>
                    <InputLabel>Class Full Option</InputLabel>
                    <Select value={this.state.coursesFull} onChange={this.handleChange('coursesFull')}>
                        <MenuItem value={'ANY'}>Include all classes</MenuItem>
                        <MenuItem value={'SkipFullWaitlist'}>Include full courses if space on waitlist</MenuItem>
                        <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
                        <MenuItem value={'FullOnly'}>Show only full or waitlisted courses</MenuItem>
                        <MenuItem value={'Overenrolled'}>Show only over-enrolled courses</MenuItem>
                    </Select>
                </FormControl>
                <br />
                <br />
                <br />
                <FormControl>
                    <InputLabel id="starts-after-dropdown-label">Starts After</InputLabel>
                    <Select
                        labelId="starts-after-dropdown-label"
                        value={this.state.startTime}
                        onChange={this.handleChange('startTime')}
                        className={classes.timePicker}
                    >
                        {startsAfterMenuItems}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel id="ends-before-dropdown-label">Ends Before</InputLabel>
                    <Select
                        labelId="ends-before-dropdown-label"
                        value={this.state.endTime}
                        onChange={this.handleChange('endTime')}
                        className={classes.timePicker}
                    >
                        {endsBeforeMenuItems}
                    </Select>
                    {/* <TimePicker
                        label="Ends Before"
                        value={this.state.endTime}
                        onChange={this.handleChange('endTime')}
                        minutesStep={60}
                        clearable
                        width={0.15}
                    /> */}
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            onChange={this.handleChange('online')}
                            value="online"
                            color="primary"
                            checked={this.state.building === 'ON'}
                        />
                    }
                    label="Online Classes Only"
                />

                <TextField
                    id="building"
                    label="Building"
                    type="search"
                    value={this.state.building}
                    onChange={this.handleChange('building')}
                />

                <TextField
                    id="room"
                    label="Room"
                    type="search"
                    value={this.state.room}
                    onChange={this.handleChange('room')}
                />
            </div>
        );
    }
}

AdvancedSearchTextFields = withStyles(styles)(AdvancedSearchTextFields);

const parentStyles = {
    container: {
        display: 'inline-flex',
        marginTop: 10,
        marginBottom: 10,
        cursor: 'pointer',

        '& > div': {
            marginRight: 5,
        },
    },
};

class AdvancedSearch extends PureComponent {
    constructor(props) {
        super(props);

        let advanced = false;
        if (typeof Storage !== 'undefined') {
            advanced = window.localStorage.getItem('advanced') === 'expanded';
        }

        this.state = {
            expandAdvanced: advanced,
        };
    }

    handleExpand = () => {
        const nextExpansionState = !this.state.expandAdvanced;
        window.localStorage.setItem('advanced', nextExpansionState ? 'expanded' : 'notexpanded');
        this.setState({ expandAdvanced: nextExpansionState });
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <div onClick={this.handleExpand} className={classes.container}>
                    <div>
                        <Typography noWrap variant="body1">
                            Advanced Search Options
                        </Typography>
                    </div>
                    {this.state.expandAdvanced ? <ExpandLess /> : <ExpandMore />}
                </div>
                <Collapse in={this.state.expandAdvanced}>
                    <AdvancedSearchTextFields />
                </Collapse>
            </Fragment>
        );
    }
}

export default withStyles(parentStyles)(AdvancedSearch);

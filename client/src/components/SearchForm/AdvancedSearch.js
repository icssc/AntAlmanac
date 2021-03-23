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
import { KeyboardTimePicker } from '@material-ui/pickers';

const styles = {
    units: {
        width: '80px',
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
                        [name]: event,
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

                <form>
                    <KeyboardTimePicker
                        label="Starts After"
                        value={this.state.startTime}
                        onChange={this.handleChange('startTime')}
                        minutesStep={60}
                        clearable
                    />
                </form>

                <form>
                    <KeyboardTimePicker
                        label="Ends Before"
                        value={this.state.endTime}
                        onChange={this.handleChange('endTime')}
                        minutesStep={60}
                        clearable
                        width={0.15}
                    />
                </form>

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

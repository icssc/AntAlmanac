import {
    Box,
    Button,
    Collapse,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Theme,
    Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';
import { LocalStorageKeys, getLocalStorageItem, setLocalStorageItem } from '$lib/localStorage';

const styles: Styles<Theme, object> = {
    fieldContainer: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        paddingLeft: '8px',
        paddingRight: '8px',
        marginBottom: '1rem',
    },
    units: {
        width: '80px',
    },
    timePicker: {
        width: '130px',
    },
    onlineSwitch: {
        margin: 0,
        justifyContent: 'flex-end',
        left: 0,
    },
};

interface AdvancedSearchTextFieldsProps {
    classes?: ClassNameMap;
}

interface AdvancedSearchTextFieldsState {
    instructor: string;
    units: string;
    endTime: string;
    startTime: string;
    coursesFull: string;
    building: string;
    room: string;
    division: string;
}

interface AdvancedSearchProps {
    classes: ClassNameMap;
}

interface AdvancedSearchState {
    expandAdvanced: boolean;
}

class UnstyledAdvancedSearchTextFields extends PureComponent<
    AdvancedSearchTextFieldsProps,
    AdvancedSearchTextFieldsState
> {
    state = {
        instructor: RightPaneStore.getFormData().instructor,
        units: RightPaneStore.getFormData().units,
        endTime: RightPaneStore.getFormData().endTime,
        startTime: RightPaneStore.getFormData().startTime,
        coursesFull: RightPaneStore.getFormData().coursesFull,
        building: RightPaneStore.getFormData().building,
        room: RightPaneStore.getFormData().room,
        division: RightPaneStore.getFormData().division,
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({
            instructor: RightPaneStore.getFormData().instructor,
            units: RightPaneStore.getFormData().units,
            endTime: RightPaneStore.getFormData().endTime,
            startTime: RightPaneStore.getFormData().startTime,
            coursesFull: RightPaneStore.getFormData().coursesFull,
            building: RightPaneStore.getFormData().building,
            room: RightPaneStore.getFormData().room,
            division: RightPaneStore.getFormData().division,
        });
    };

    handleChange = (name: string) => (event: ChangeEvent<{ checked?: boolean; name?: string; value: unknown }>) => {
        if (name === 'online') {
            if (event.target.checked) {
                this.setState({ building: 'ON', room: 'LINE' });
                RightPaneStore.updateFormValue('building', 'ON');
                RightPaneStore.updateFormValue('room', 'LINE');
            } else {
                this.setState({ building: '', room: '' });
                RightPaneStore.updateFormValue('building', '');
                RightPaneStore.updateFormValue('room', '');
            }
        } else {
            this.setState({ [name]: event.target.value } as unknown as AdvancedSearchTextFieldsState);
            RightPaneStore.updateFormValue(name, event.target.value as string);
        }
    };

    /**
     * UPDATE (6-28-19): Transfered course code and course number search boxes to
     * separate classes.
     */
    render() {
        const { classes } = this.props;

        // List of times from 2:00am-11:00pm
        const menuItemTimes = [
            ...[...Array(10).keys()].map((v) => `${v + 2}:00am`),
            '12:00pm',
            ...[...Array(11).keys()].map((v) => `${v + 1}:00pm`),
        ];
        // Creates a MenuItem for time selection
        const createdMenuItemTime = (time: string) => (
            <MenuItem key={time} value={`${time}`}>
                {time ? time : <em>None</em>}
            </MenuItem>
        );
        // Build arrays of MenuItem elements for time selection
        const startsAfterMenuItems = ['', '1:00am', ...menuItemTimes].map((time) => createdMenuItemTime(time));
        const endsBeforeMenuItems = ['', ...menuItemTimes].map((time) => createdMenuItemTime(time));

        return (
            <Box className={classes?.fieldContainer}>
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
                    type="search"
                    helperText="ex. 3, 4, or VAR"
                    className={classes?.units}
                />

                <FormControl>
                    <InputLabel>Class Full Option</InputLabel>
                    <Select
                        value={this.state.coursesFull}
                        onChange={this.handleChange('coursesFull')}
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                            getContentAnchorEl: null,
                        }}
                    >
                        <MenuItem value={'ANY'}>Include all classes</MenuItem>
                        <MenuItem value={'SkipFullWaitlist'}>Include full courses if space on waitlist</MenuItem>
                        <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
                        <MenuItem value={'FullOnly'}>Show only full or waitlisted courses</MenuItem>
                        <MenuItem value={'Overenrolled'}>Show only over-enrolled courses</MenuItem>
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel id="division-label" shrink>
                        Course Level
                    </InputLabel>
                    <Select
                        labelId="division-label"
                        value={this.state.division}
                        onChange={this.handleChange('division')}
                        className={classes?.courseLevel}
                        displayEmpty
                        MenuProps={{
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                            getContentAnchorEl: null,
                        }}
                    >
                        <MenuItem value={''}>Any Division</MenuItem>
                        <MenuItem value={'LowerDiv'}>Lower Division</MenuItem>
                        <MenuItem value={'UpperDiv'}>Upper Division</MenuItem>
                        <MenuItem value={'Graduate'}>Graduate/Professional</MenuItem>
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel id="starts-after-dropdown-label">Starts After</InputLabel>
                    <Select
                        labelId="starts-after-dropdown-label"
                        value={this.state.startTime}
                        onChange={this.handleChange('startTime')}
                        className={classes?.timePicker}
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
                        className={classes?.timePicker}
                    >
                        {endsBeforeMenuItems}
                    </Select>
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
                    label="Online Only"
                    labelPlacement="top"
                    className={classes?.onlineSwitch}
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
            </Box>
        );
    }
}

const AdvancedSearchTextFields = withStyles(styles)(UnstyledAdvancedSearchTextFields);

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

class AdvancedSearch extends PureComponent<AdvancedSearchProps, AdvancedSearchState> {
    constructor(props: AdvancedSearchProps) {
        super(props);

        let advanced = false;
        if (typeof Storage !== 'undefined') {
            advanced = getLocalStorageItem(LocalStorageKeys.advanced) === 'expanded';
        }

        this.state = {
            expandAdvanced: advanced,
        };
    }

    handleExpand = () => {
        const nextExpansionState = !this.state.expandAdvanced;
        setLocalStorageItem(LocalStorageKeys.advanced, nextExpansionState ? 'expanded' : 'notexpanded');
        this.setState({ expandAdvanced: nextExpansionState });
    };

    render() {
        return (
            <>
                <Button
                    onClick={this.handleExpand}
                    style={{ textTransform: 'none', width: 'auto', display: 'flex', justifyContent: 'start' }}
                >
                    <div>
                        <Typography noWrap variant="body1">
                            Advanced Search Options
                        </Typography>
                    </div>
                    {this.state.expandAdvanced ? <ExpandLess /> : <ExpandMore />}
                </Button>
                <Collapse in={this.state.expandAdvanced}>
                    <AdvancedSearchTextFields />
                </Collapse>
            </>
        );
    }
}

export default withStyles(parentStyles)(AdvancedSearch);

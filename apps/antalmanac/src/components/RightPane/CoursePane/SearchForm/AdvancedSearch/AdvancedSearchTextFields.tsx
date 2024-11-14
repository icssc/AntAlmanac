import { TextField, Box, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@material-ui/core';
import { useState, useEffect, useCallback } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';

export function AdvancedSearchTextFields() {
    const [instructor, setInstructor] = useState(RightPaneStore.getFormData().instructor);
    const [units, setUnits] = useState(RightPaneStore.getFormData().units);
    const [endTime, setEndTime] = useState(RightPaneStore.getFormData().endTime);
    const [startTime, setStartTime] = useState(RightPaneStore.getFormData().startTime);
    const [coursesFull, setCoursesFull] = useState(RightPaneStore.getFormData().coursesFull);
    const [building, setBuilding] = useState(RightPaneStore.getFormData().building);
    const [room, setRoom] = useState(RightPaneStore.getFormData().room);
    const [division, setDivision] = useState(RightPaneStore.getFormData().division);
    const [excludedRestrictions, setExcludedRestrictions] = useState(RightPaneStore.getFormData().excludedRestrictions);

    const resetField = useCallback(() => {
        const formData = RightPaneStore.getFormData();
        setInstructor(formData.instructor);
        setUnits(formData.units);
        setEndTime(formData.endTime);
        setStartTime(formData.startTime);
        setCoursesFull(formData.coursesFull);
        setBuilding(formData.building);
        setRoom(formData.room);
        setDivision(formData.division);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);
        return () => {
            RightPaneStore.removeListener('formReset', resetField);
        };
    }, [resetField]);

    const handleChange =
        (name: string) =>
        (
            event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | { name?: string | undefined; value: unknown }
            >
        ) => {
            const stateObj = { url: 'url' };
            const url = new URL(window.location.href);
            const urlParam = new URLSearchParams(url.search);
            const value = event.target.value as string | string[];

            if (name === 'online') {
                if (event.target instanceof HTMLInputElement && event.target.checked) {
                    setBuilding('ON');
                    setRoom('LINE');
                    RightPaneStore.updateFormValue('building', 'ON');
                    RightPaneStore.updateFormValue('room', 'LINE');
                    urlParam.set('building', 'ON');
                    urlParam.set('room', 'LINE');
                } else {
                    setBuilding('');
                    setRoom('');
                    RightPaneStore.updateFormValue('building', '');
                    RightPaneStore.updateFormValue('room', '');
                    urlParam.delete('building');
                    urlParam.delete('room');
                }
            } else {
                const stringValue = Array.isArray(value) ? value.join('') : value;

                switch (name) {
                    case 'instructor':
                        setInstructor(stringValue);
                        break;
                    case 'units':
                        setUnits(stringValue);
                        break;
                    case 'endTime':
                        setEndTime(stringValue);
                        break;
                    case 'startTime':
                        setStartTime(stringValue);
                        break;
                    case 'coursesFull':
                        setCoursesFull(stringValue);
                        break;
                    case 'building':
                        setBuilding(stringValue);
                        break;
                    case 'room':
                        setRoom(stringValue);
                        break;
                    case 'division':
                        setDivision(stringValue);
                        break;
                    case 'excludedRestrictions':
                        setExcludedRestrictions(stringValue);
                        break;
                    default:
                        break;
                }

                if (stringValue !== '') {
                    urlParam.set(name, String(stringValue));
                } else {
                    urlParam.delete(name);
                }

                RightPaneStore.updateFormValue(name, stringValue);
            }

            const param = urlParam.toString();
            const newUrl = `${param.trim() ? '?' : ''}${param}`;
            history.replaceState(stateObj, 'url', '/' + newUrl);
        };

    // List of times from 2:00am-11:00pm
    const menuItemTimes = [
        ...[...Array(10).keys()].map((v) => `${v + 2}:00am`),
        '12:00pm',
        ...[...Array(11).keys()].map((v) => `${v + 1}:00pm`),
    ];

    const createdMenuItemTime = (time: string) => (
        <MenuItem key={time} value={`${time}`}>
            {time ? time : <em>None</em>}
        </MenuItem>
    );

    const startsAfterMenuItems = ['', '1:00am', ...menuItemTimes].map((time) => createdMenuItemTime(time));
    const endsBeforeMenuItems = ['', ...menuItemTimes].map((time) => createdMenuItemTime(time));

    return (
        <Box
            style={{
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                paddingLeft: '8px',
                paddingRight: '8px',
                marginBottom: '1rem',
            }}
        >
            <TextField
                label="Instructor"
                type="search"
                value={instructor}
                onChange={handleChange('instructor')}
                helperText="Last name only"
            />

            <TextField
                id="units"
                label="Units"
                value={units}
                onChange={handleChange('units')}
                type="search"
                helperText="ex. 3, 4, or VAR"
                style={{ width: 80 }}
            />

            <FormControl>
                <InputLabel>Class Full Option</InputLabel>
                <Select
                    value={coursesFull}
                    onChange={handleChange('coursesFull')}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                        },
                        transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                        },
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
                    value={division}
                    onChange={handleChange('division')}
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
                    value={startTime}
                    onChange={handleChange('startTime')}
                    style={{ width: 130 }}
                >
                    {startsAfterMenuItems}
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel id="ends-before-dropdown-label">Ends Before</InputLabel>
                <Select
                    labelId="ends-before-dropdown-label"
                    value={endTime}
                    onChange={handleChange('endTime')}
                    style={{ width: 130 }}
                >
                    {endsBeforeMenuItems}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Switch
                        onChange={handleChange('online')}
                        value="online"
                        color="primary"
                        checked={building === 'ON'}
                    />
                }
                label="Online Only"
                labelPlacement="top"
                style={{ margin: 0, justifyContent: 'flex-end' }}
            />

            <TextField
                id="building"
                label="Building"
                type="search"
                value={building}
                onChange={handleChange('building')}
            />

            <TextField id="room" label="Room" type="search" value={room} onChange={handleChange('room')} />

            <FormControl style={{ minWidth: 150 }}>
                <InputLabel id="excluded-restrictions-label">Excluded Restrictions</InputLabel>
                <Select
                    multiple
                    labelId="excluded-restrictions-label"
                    value={excludedRestrictions.split('')}
                    onChange={handleChange('excludedRestrictions')}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                >
                    <MenuItem value={'A'}>A: Prerequisite required</MenuItem>
                    <MenuItem value={'B'}>B: Authorization code required</MenuItem>
                    <MenuItem value={'C'}>C: Fee required</MenuItem>
                    <MenuItem value={'D'}>D: Pass/Not Pass option only</MenuItem>
                    <MenuItem value={'E'}>E: Freshmen only</MenuItem>
                    <MenuItem value={'F'}>F: Sophomores only</MenuItem>
                    <MenuItem value={'G'}>G: Lower-division only</MenuItem>
                    <MenuItem value={'H'}>H: Juniors only</MenuItem>
                    <MenuItem value={'I'}>I: Seniors only</MenuItem>
                    <MenuItem value={'J'}>J: Upper-division only</MenuItem>
                    <MenuItem value={'K'}>K: Graduate only</MenuItem>
                    <MenuItem value={'L'}>L: Major only</MenuItem>
                    <MenuItem value={'M'}>M: Non-major only</MenuItem>
                    <MenuItem value={'N'}>N: School major only</MenuItem>
                    <MenuItem value={'O'}>O: Non-school major only</MenuItem>
                    <MenuItem value={'R'}>R: Biomedical Pass/Fail course (School of Medicine only)</MenuItem>
                    <MenuItem value={'S'}>S: Satisfactory/Unsatisfactory only</MenuItem>
                    <MenuItem value={'X'}>
                        X: Separate authorization codes required to add, drop, or change enrollment
                    </MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}

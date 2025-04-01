import { TextField, Box, FormControl, InputLabel, Select, Switch, FormControlLabel } from '@material-ui/core';
import { MenuItem } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
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
    const [excludeRestrictionCodes, setExcludeRestrictionCodes] = useState(
        RightPaneStore.getFormData().excludeRestrictionCodes
    );
    const [days, setDays] = useState(RightPaneStore.getFormData().days);

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
        setExcludeRestrictionCodes(formData.excludeRestrictionCodes);
        setDays(formData.days);
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
                    case 'excludeRestrictionCodes':
                        setExcludeRestrictionCodes(stringValue);
                        break;
                    case 'days': {
                        setDays(stringValue);
                        break;
                    }
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
                <InputLabel id="exclude-restriction-codes-label">Exclude Restrictions</InputLabel>
                <Select
                    multiple
                    labelId="exclude-restriction-codes-label"
                    value={excludeRestrictionCodes.split('')}
                    onChange={handleChange('excludeRestrictionCodes')}
                    renderValue={(selected) => (selected as string[]).join(', ')}
                >
                    {EXCLUDE_RESTRICTION_CODES_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            style={{
                                maxWidth: 240,
                            }}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {option.label}
                            </span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl style={{ minWidth: 150 }}>
                <InputLabel id="days-label">Days</InputLabel>
                <Select
                    multiple
                    labelId="days-label"
                    value={days ? days.split(/(?=[A-Z])/) : []}
                    onChange={handleChange('days')}
                    renderValue={(selected) =>
                        (selected as string[])
                            .sort((a, b) => {
                                const orderA = DAYS_OPTIONS.find((day) => day.value === a)?.order ?? Infinity;
                                const orderB = DAYS_OPTIONS.find((day) => day.value === b)?.order ?? Infinity;
                                return orderA - orderB;
                            })
                            .join(', ')
                    }
                >
                    {DAYS_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            style={{
                                maxWidth: 240,
                            }}
                        >
                            <span
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {option.label}
                            </span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

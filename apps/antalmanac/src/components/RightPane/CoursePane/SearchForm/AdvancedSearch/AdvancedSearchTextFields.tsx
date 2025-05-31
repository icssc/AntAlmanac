import { MenuItem, Box, type SelectChangeEvent } from '@mui/material';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';

import { AdornedSelect } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/AdornedSelect';
import { AdornedTextField } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/AdornedTextField';
import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { AdvancedSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { safeUnreachableCase } from '$lib/utils';

export function AdvancedSearchTextFields() {
    const [instructor, setInstructor] = useState(() => RightPaneStore.getFormData().instructor);
    const [units, setUnits] = useState(() => RightPaneStore.getFormData().units);
    const [endTime, setEndTime] = useState(() => RightPaneStore.getFormData().endTime);
    const [startTime, setStartTime] = useState(() => RightPaneStore.getFormData().startTime);
    const [coursesFull, setCoursesFull] = useState(() => RightPaneStore.getFormData().coursesFull);
    const [building, setBuilding] = useState(() => RightPaneStore.getFormData().building);
    const [room, setRoom] = useState(() => RightPaneStore.getFormData().room);
    const [division, setDivision] = useState(() => RightPaneStore.getFormData().division);
    const [excludeRestrictionCodes, setExcludeRestrictionCodes] = useState(
        () => RightPaneStore.getFormData().excludeRestrictionCodes
    );
    const [days, setDays] = useState(() => RightPaneStore.getFormData().days);

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

    const changeHandlerFactory =
        (name: AdvancedSearchParam | 'online') =>
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | string[]>) => {
            const stateObj = { url: 'url' };
            const url = new URL(window.location.href);
            const urlParam = new URLSearchParams(url.search);

            if (name === 'online') {
                const checked = event.target.value === 'true';
                if (checked) {
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
                return;
            }

            const value = event.target.value;
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
                case 'days':
                    setDays(stringValue);
                    break;
                default:
                    safeUnreachableCase(name);
                    break;
            }

            if (stringValue !== '') {
                urlParam.set(name, String(stringValue));
            } else {
                urlParam.delete(name);
            }

            const param = urlParam.toString();
            const newUrl = `${param.trim() ? '?' : ''}${param}`;
            history.replaceState(stateObj, 'url', '/' + newUrl);

            RightPaneStore.updateFormValue(name, stringValue);
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
            sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                marginBottom: '1rem',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <AdornedTextField
                    label="Instructor"
                    textFieldProps={{
                        type: 'search',
                        value: instructor,
                        onChange: changeHandlerFactory('instructor'),
                        placeholder: 'Last name only',
                    }}
                />

                <AdornedTextField
                    label="Units"
                    textFieldProps={{
                        value: units,
                        onChange: changeHandlerFactory('units'),
                        type: 'search',
                        id: 'units',
                        placeholder: 'ex. 3, 4, or VAR',
                    }}
                />
                <AdornedSelect
                    label="Class Full Option"
                    selectProps={{
                        value: coursesFull,
                        onChange: changeHandlerFactory('coursesFull'),
                    }}
                >
                    <MenuItem value={'ANY'}>Include all classes</MenuItem>
                    <MenuItem value={'SkipFullWaitlist'}>Include full courses if space on waitlist</MenuItem>
                    <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
                    <MenuItem value={'FullOnly'}>Show only full or waitlisted courses</MenuItem>
                    <MenuItem value={'Overenrolled'}>Show only over-enrolled courses</MenuItem>
                </AdornedSelect>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <AdornedSelect
                    label="Course Level"
                    selectProps={{
                        value: division,
                        onChange: changeHandlerFactory('division'),
                        displayEmpty: true,
                        MenuProps: {
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                        },
                    }}
                >
                    <MenuItem value={''}>Any Division</MenuItem>
                    <MenuItem value={'LowerDiv'}>Lower Division</MenuItem>
                    <MenuItem value={'UpperDiv'}>Upper Division</MenuItem>
                    <MenuItem value={'Graduate'}>Graduate/Professional</MenuItem>
                </AdornedSelect>
                <Box
                    sx={{
                        display: 'flex',
                        rowGap: 1,
                        columnGap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <AdornedSelect
                        label="Starts After"
                        selectProps={{
                            value: startTime,
                            onChange: changeHandlerFactory('startTime'),
                        }}
                    >
                        {startsAfterMenuItems}
                    </AdornedSelect>

                    <AdornedSelect
                        label="Ends Before"
                        selectProps={{
                            value: endTime,
                            onChange: changeHandlerFactory('endTime'),
                        }}
                    >
                        {endsBeforeMenuItems}
                    </AdornedSelect>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <AdornedSelect
                    label="Online Only"
                    selectProps={{
                        value: building === 'ON' ? 'true' : 'false',
                        onChange: changeHandlerFactory('online'),
                    }}
                >
                    <MenuItem value="false">False</MenuItem>
                    <MenuItem value="true">True</MenuItem>
                </AdornedSelect>
                <AdornedTextField
                    label="Building"
                    textFieldProps={{
                        id: 'building',
                        type: 'search',
                        value: building,
                        onChange: changeHandlerFactory('building'),
                    }}
                />
                <AdornedTextField
                    label="Room"
                    textFieldProps={{
                        id: 'room',
                        type: 'search',
                        value: room,
                        onChange: changeHandlerFactory('room'),
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <AdornedSelect
                    label="Exclude Restrictions"
                    selectProps={{
                        multiple: true,
                        value: excludeRestrictionCodes.split(''),
                        onChange: changeHandlerFactory('excludeRestrictionCodes'),
                        renderValue: (selected) => (selected as string[]).join(', '),
                    }}
                >
                    {EXCLUDE_RESTRICTION_CODES_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            sx={{
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
                </AdornedSelect>
                <AdornedSelect
                    label="Days"
                    selectProps={{
                        multiple: true,
                        value: days ? days.split(/(?=[A-Z])/) : [],
                        onChange: changeHandlerFactory('days'),
                        renderValue: (selected) =>
                            (selected as string[])
                                .sort((a, b) => {
                                    const orderA = DAYS_OPTIONS.findIndex((day) => day.value === a);
                                    const orderB = DAYS_OPTIONS.findIndex((day) => day.value === b);
                                    return orderA - orderB;
                                })
                                .join(', '),
                    }}
                >
                    {DAYS_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            sx={{
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
                </AdornedSelect>
            </Box>
        </Box>
    );
}

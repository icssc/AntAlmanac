import { MenuItem, Box, type SelectChangeEvent, Checkbox, ListItemText } from '@mui/material';
import { format, parse } from 'date-fns';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';

import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabelledSelect } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabeledSelect';
import { LabelledTextField } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabeledTextField';
import { LabelledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabeledTimePicker';
import { AdvancedSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { safeUnreachableCase } from '$lib/utils';

type InputEvent =
    | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    | SelectChangeEvent<string | string[]>
    | Date
    | null;

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

    const updateValue = (name: AdvancedSearchParam, stringValue: string) => {
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
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

    const changeHandlerFactory = (name: AdvancedSearchParam | 'online') => (event: InputEvent) => {
        if (name === 'startTime' || name === 'endTime') {
            // time picker event is Date | null
            if (event instanceof Date || event === null) {
                const stringTime = event ? format(event, 'HH:mm') : '';
                if (name === 'startTime') {
                    setStartTime(stringTime);
                } else {
                    setEndTime(stringTime);
                }
                updateValue(name, stringTime);
                return;
            }
        }

        if (name === 'online') {
            const url = new URL(window.location.href);
            const urlParam = new URLSearchParams(url.search);
            const checked = (event as ChangeEvent<HTMLInputElement>).target.value === 'true';
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

        const value = (event as Exclude<InputEvent, Date | null>).target.value;
        const stringValue = Array.isArray(value) ? value.join('') : value;

        switch (name) {
            case 'instructor':
                setInstructor(stringValue);
                break;
            case 'units':
                setUnits(stringValue);
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
            case 'startTime':
                break;
            case 'endTime':
                break;
            default:
                safeUnreachableCase(name);
                break;
        }

        updateValue(name, stringValue);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                marginBottom: '1rem',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    width: '100%',
                }}
            >
                <LabelledTextField
                    label="Instructor"
                    textFieldProps={{
                        type: 'search',
                        value: instructor,
                        onChange: changeHandlerFactory('instructor'),
                        placeholder: 'Last name only',
                        fullWidth: true,
                    }}
                />

                <LabelledTextField
                    label="Units"
                    textFieldProps={{
                        value: units,
                        onChange: changeHandlerFactory('units'),
                        type: 'search',
                        placeholder: 'ex. 3, 4, or VAR',
                        fullWidth: true,
                    }}
                />

                <LabelledSelect
                    label="Class Full Option"
                    selectProps={{
                        value: coursesFull,
                        onChange: changeHandlerFactory('coursesFull'),
                        sx: {
                            width: '100%',
                        },
                    }}
                >
                    <MenuItem value={'ANY'}>Include all classes</MenuItem>
                    <MenuItem value={'SkipFullWaitlist'}>Include full courses if space on waitlist</MenuItem>
                    <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
                    <MenuItem value={'FullOnly'}>Show only full or waitlisted courses</MenuItem>
                    <MenuItem value={'Overenrolled'}>Show only over-enrolled courses</MenuItem>
                </LabelledSelect>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    width: '100%',
                }}
            >
                <LabelledSelect
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
                        sx: {
                            width: '100%',
                        },
                    }}
                >
                    <MenuItem value={''}>Any Division</MenuItem>
                    <MenuItem value={'LowerDiv'}>Lower Division</MenuItem>
                    <MenuItem value={'UpperDiv'}>Upper Division</MenuItem>
                    <MenuItem value={'Graduate'}>Graduate/Professional</MenuItem>
                </LabelledSelect>

                <LabelledTimePicker
                    label="Starts After"
                    timePickerProps={{
                        value: startTime ? parse(startTime, 'HH:mm', new Date()) : null,
                        onChange: changeHandlerFactory('startTime'),
                        timeSteps: { minutes: 10 },
                    }}
                    textFieldProps={{
                        fullWidth: true,
                        sx: {
                            minWidth: 120,
                        },
                    }}
                />

                <LabelledTimePicker
                    label="Ends Before"
                    timePickerProps={{
                        value: endTime ? parse(endTime, 'HH:mm', new Date()) : null,
                        onChange: changeHandlerFactory('endTime'),
                        timeSteps: { minutes: 10 },
                    }}
                    textFieldProps={{
                        fullWidth: true,
                        sx: {
                            minWidth: 120,
                        },
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    width: '100%',
                }}
            >
                <LabelledSelect
                    label="Online Only"
                    selectProps={{
                        value: building === 'ON' ? 'true' : 'false',
                        onChange: changeHandlerFactory('online'),
                        sx: {
                            width: '100%',
                        },
                    }}
                >
                    <MenuItem value="false">False</MenuItem>
                    <MenuItem value="true">True</MenuItem>
                </LabelledSelect>

                <LabelledTextField
                    label="Building"
                    textFieldProps={{
                        id: 'building',
                        type: 'search',
                        value: building,
                        onChange: changeHandlerFactory('building'),
                        fullWidth: true,
                    }}
                />

                <LabelledTextField
                    label="Room"
                    textFieldProps={{
                        id: 'room',
                        type: 'search',
                        value: room,
                        onChange: changeHandlerFactory('room'),
                        fullWidth: true,
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    width: '100%',
                }}
            >
                <LabelledSelect
                    label="Exclude Restrictions"
                    selectProps={{
                        multiple: true,
                        value: excludeRestrictionCodes.split(''),
                        onChange: changeHandlerFactory('excludeRestrictionCodes'),
                        renderValue: (selected) => (selected as string[]).join(', '),
                        sx: {
                            width: '100%',
                        },
                    }}
                >
                    {EXCLUDE_RESTRICTION_CODES_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ paddingY: 0.25 }}>
                            <Checkbox
                                checked={excludeRestrictionCodes.includes(option.value)}
                                inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                            />
                            <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                        </MenuItem>
                    ))}
                </LabelledSelect>

                <LabelledSelect
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
                        sx: {
                            width: '100%',
                        },
                    }}
                >
                    {DAYS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ paddingY: 0.25 }}>
                            <Checkbox
                                checked={days.includes(option.value)}
                                inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                            />
                            <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                        </MenuItem>
                    ))}
                </LabelledSelect>
            </Box>
        </Box>
    );
}

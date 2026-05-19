import { SignInDialog } from '$components/dialogs/SignInDialog';
import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { AdvancedSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { replaceUrlSearchParams, safeUnreachableCase } from '$lib/utils';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { MenuItem, Box, type SelectChangeEvent, Checkbox, ListItemText, Tooltip, Typography } from '@mui/material';
import type { Roadmap } from '@packages/antalmanac-types';
import { format, isValid, parse } from 'date-fns';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';

type InputEvent =
    | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    | SelectChangeEvent<string | string[]>
    | Date
    | null;

type RoadmapMenuItemsProps = {
    isLoggedIn: boolean;
    roadmaps: Roadmap[];
};

function getRoadmapMenuItems({ isLoggedIn, roadmaps }: RoadmapMenuItemsProps) {
    if (!isLoggedIn) {
        return [
            <MenuItem key="signin" value="">
                Sign In to filter
            </MenuItem>,
        ];
    }

    if (roadmaps.length === 0) {
        return <CreateRoadmapLinkItem verticalPadding={'6px'} value="" />;
    }

    return [
        <MenuItem key="all" value="">
            {' '}
            Include all courses
        </MenuItem>,
        ...roadmaps.map((roadmap) => (
            <MenuItem key={roadmap.id} value={roadmap.id.toString()}>
                {roadmap.name}
            </MenuItem>
        )),
    ];
}

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
    const [excludeRoadmapCourses, setExcludeRoadmapCourses] = useState(
        () => RightPaneStore.getFormData().excludeRoadmapCourses
    );
    const { plannerRoadmaps, updateTakenCourses } = usePlannerStore(
        useShallow((s) => ({ plannerRoadmaps: s.plannerRoadmaps, updateTakenCourses: s.updateTakenCourses }))
    );
    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const [signInOpen, setSignInOpen] = useState(false);

    const syncFieldStates = useCallback(() => {
        const formData = RightPaneStore.getFormData();
        setInstructor(formData.instructor);
        setUnits(formData.units);
        setEndTime(formData.endTime);
        setStartTime(formData.startTime);
        setCoursesFull(formData.coursesFull);
        setBuilding(formData.building);
        setRoom(formData.room);
        setDivision(formData.division);
        setExcludeRoadmapCourses(formData.excludeRoadmapCourses);
        setExcludeRestrictionCodes(formData.excludeRestrictionCodes);
        setDays(formData.days);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formDataChange', syncFieldStates);
        RightPaneStore.on('formReset', syncFieldStates);

        return () => {
            RightPaneStore.removeListener('formDataChange', syncFieldStates);
            RightPaneStore.removeListener('formReset', syncFieldStates);
        };
    }, [syncFieldStates]);

    const updateValue = (name: AdvancedSearchParam, stringValue: string) => {
        replaceUrlSearchParams((params) => {
            if (stringValue !== '') {
                params.set(name, String(stringValue));
            } else {
                params.delete(name);
            }
        });

        RightPaneStore.updateFormValue(name, stringValue);
    };

    const changeHandlerFactory = (name: AdvancedSearchParam | 'online') => (event: InputEvent) => {
        if (name === 'startTime' || name === 'endTime') {
            // time picker event is Date | null
            if (event instanceof Date || event === null) {
                // Guard against Invalid Date (e.g. user typing a partial time in the picker).
                // Calling format() on an Invalid Date throws RangeError: Invalid time value.
                const stringTime = event && isValid(event) ? format(event, 'HH:mm') : '';
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
            const checked = (event as ChangeEvent<HTMLInputElement>).target.value === 'true';
            const nextBuilding = checked ? 'ON' : '';
            const nextRoom = checked ? 'LINE' : '';

            setBuilding(nextBuilding);
            setRoom(nextRoom);
            RightPaneStore.updateFormValue('building', nextBuilding);
            RightPaneStore.updateFormValue('room', nextRoom);

            replaceUrlSearchParams((params) => {
                if (nextBuilding) {
                    params.set('building', nextBuilding);
                    params.set('room', nextRoom);
                } else {
                    params.delete('building');
                    params.delete('room');
                }
            });
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
            case 'excludeRoadmapCourses':
                setExcludeRoadmapCourses(stringValue);
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

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    useEffect(() => {
        updateTakenCourses(excludeRoadmapCourses);

        if (!excludeRoadmapCourses) return;
        if (!plannerRoadmaps || plannerRoadmaps.length === 0) return;

        const exists = plannerRoadmaps.some((r) => r.id.toString() === excludeRoadmapCourses);

        if (!exists) {
            openSnackbar('warning', 'Invalid roadmap selection. All courses shown.');
            setExcludeRoadmapCourses('');
            RightPaneStore.updateFormValue('excludeRoadmapCourses', '');
            replaceUrlSearchParams((params) => params.delete('excludeRoadmapCourses'));
        }
    }, [plannerRoadmaps, excludeRoadmapCourses]);

    return (
        <>
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
                    <LabeledTextField
                        label="Instructor"
                        textFieldProps={{
                            type: 'search',
                            value: instructor,
                            onChange: changeHandlerFactory('instructor'),
                            placeholder: 'Last name only',
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
                        label="Units"
                        textFieldProps={{
                            value: units,
                            onChange: changeHandlerFactory('units'),
                            type: 'search',
                            placeholder: 'ex. 4 or VAR',
                            fullWidth: true,
                        }}
                    />

                    <LabeledSelect
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
                    </LabeledSelect>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <LabeledSelect
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
                    </LabeledSelect>

                    <LabeledTimePicker
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

                    <LabeledTimePicker
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
                    <LabeledSelect
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
                    </LabeledSelect>

                    <LabeledTextField
                        label="Building"
                        textFieldProps={{
                            id: 'building',
                            type: 'search',
                            value: building,
                            onChange: changeHandlerFactory('building'),
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
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
                    <LabeledSelect
                        label={
                            <Tooltip
                                title={
                                    <Typography sx={{ fontSize: '0.8rem' }}>
                                        Data from AntAlmanac.com/planner
                                    </Typography>
                                }
                            >
                                <Box>Exclude Taken Courses</Box>
                            </Tooltip>
                        }
                        selectProps={{
                            value: excludeRoadmapCourses,
                            onChange: changeHandlerFactory('excludeRoadmapCourses'),
                            displayEmpty: true,
                            sx: {
                                width: '100%',
                            },
                            onOpen: () => {
                                if (!sessionIsValid) {
                                    setSignInOpen(true);
                                }
                            },
                            open: !sessionIsValid ? false : undefined,
                        }}
                    >
                        {getRoadmapMenuItems({ isLoggedIn: sessionIsValid, roadmaps: plannerRoadmaps })}
                    </LabeledSelect>

                    <LabeledSelect
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
                    </LabeledSelect>

                    <LabeledSelect
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
                    </LabeledSelect>
                </Box>
            </Box>
            <SignInDialog open={signInOpen} onClose={handleSignInClose} feature="Planner" />
        </>
    );
}

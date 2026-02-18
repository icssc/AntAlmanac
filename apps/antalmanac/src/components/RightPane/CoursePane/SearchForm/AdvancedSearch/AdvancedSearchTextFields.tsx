import { MenuItem, Box, type SelectChangeEvent, Checkbox, ListItemText, Tooltip, Typography } from '@mui/material';
import type { Roadmap } from '@packages/antalmanac-types';
import { format, parse } from 'date-fns';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import { AdvancedSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import { usePeterPortalRoadmaps } from '$hooks/usePeterPortal';
import { safeUnreachableCase } from '$lib/utils';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

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
        return [
            <MenuItem key="create" value="" onClick={() => window.open('https://antalmanac.com/planner', '_blank')}>
                Create a roadmap!
            </MenuItem>,
        ];
    }

    return [
        <MenuItem key="all" value="">
            {' '}
            Include all courses{' '}
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
    const { roadmaps } = usePeterPortalRoadmaps();
    const isLoggedIn = useSessionStore((s) => s.googleId !== null);
    const [signInOpen, setSignInOpen] = useState(false);
    const isDark = useThemeStore((store) => store.isDark);

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
        setExcludeRoadmapCourses(formData.excludeRoadmapCourses);
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
        if (!excludeRoadmapCourses) return;
        if (!roadmaps || roadmaps.length === 0) return;

        const exists = roadmaps.some((r) => r.id.toString() === excludeRoadmapCourses);

        if (!exists) {
            openSnackbar('warning', 'Invalid roadmap selection. All courses shown.');
            setExcludeRoadmapCourses('');
            RightPaneStore.updateFormValue('excludeRoadmapCourses', '');

            const url = new URL(window.location.href);
            const params = new URLSearchParams(url.search);
            params.delete('excludeRoadmapCourses');
            const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
            history.replaceState({}, '', newUrl);
        }
    }, [roadmaps, excludeRoadmapCourses]);

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
                            placeholder: 'ex. 3, 4, or VAR',
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
                                title={<Typography sx={{ fontSize: '0.8rem' }}>Data from PeterPortal.org</Typography>}
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
                                if (!isLoggedIn) {
                                    setSignInOpen(true);
                                }
                            },
                            open: !isLoggedIn ? false : undefined,
                        }}
                    >
                        {getRoadmapMenuItems({ isLoggedIn, roadmaps })}
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
            <SignInDialog open={signInOpen} onClose={handleSignInClose} isDark={isDark} feature="PeterPortal" />
        </>
    );
}

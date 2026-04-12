import { MenuItem, Box, type SelectChangeEvent, Checkbox, ListItemText, Tooltip, Typography } from '@mui/material';
import type { Roadmap } from '@packages/antalmanac-types';
import { format, parse } from 'date-fns';
import { useQueryStates } from 'nuqs';
import { useState, useEffect, useCallback, type ChangeEvent } from 'react';

import {
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
    DAYS_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import { searchParsers } from '$lib/searchParams';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';

type InputEvent =
    | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    | SelectChangeEvent<string | string[]>
    | Date
    | null;

type AdvancedFieldName =
    | 'instructor'
    | 'units'
    | 'endTime'
    | 'startTime'
    | 'coursesFull'
    | 'building'
    | 'room'
    | 'division'
    | 'excludeRoadmapCourses'
    | 'excludeRestrictionCodes'
    | 'days'
    | 'online';

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
            Include all courses
        </MenuItem>,
        ...roadmaps.map((roadmap) => (
            <MenuItem key={roadmap.id} value={roadmap.id.toString()}>
                {roadmap.name}
            </MenuItem>
        )),
    ];
}

const advancedParsers = {
    instructor: searchParsers.instructor,
    units: searchParsers.units,
    endTime: searchParsers.endTime,
    startTime: searchParsers.startTime,
    coursesFull: searchParsers.coursesFull,
    building: searchParsers.building,
    room: searchParsers.room,
    division: searchParsers.division,
    excludeRoadmapCourses: searchParsers.excludeRoadmapCourses,
    excludeRestrictionCodes: searchParsers.excludeRestrictionCodes,
    days: searchParsers.days,
};

export function AdvancedSearchTextFields() {
    const [formData, setFormData] = useQueryStates(advancedParsers);
    const roadmaps = useSessionStore((s) => s.plannerRoadmaps);
    const isLoggedIn = useSessionStore((s) => s.googleId !== null);
    const [signInOpen, setSignInOpen] = useState(false);
    const isDark = useThemeStore((store) => store.isDark);

    const changeHandlerFactory = (name: AdvancedFieldName) => (event: InputEvent) => {
        if (name === 'startTime' || name === 'endTime') {
            if (event instanceof Date || event === null) {
                const stringTime = event ? format(event, 'HH:mm') : '';
                setFormData({ [name]: stringTime });
                return;
            }
        }

        if (name === 'online') {
            const checked = (event as ChangeEvent<HTMLInputElement>).target.value === 'true';
            if (checked) {
                setFormData({ building: 'ON', room: 'LINE' });
            } else {
                setFormData({ building: '', room: '' });
            }
            return;
        }

        const value = (event as Exclude<InputEvent, Date | null>).target.value;
        const stringValue = Array.isArray(value) ? value.join('') : value;
        setFormData({ [name]: stringValue });
    };

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    useEffect(() => {
        if (!formData.excludeRoadmapCourses) return;
        if (!roadmaps || roadmaps.length === 0) return;

        const exists = roadmaps.some((r) => r.id.toString() === formData.excludeRoadmapCourses);

        if (!exists) {
            openSnackbar('warning', 'Invalid roadmap selection. All courses shown.');
            setFormData({ excludeRoadmapCourses: '' });
        }
    }, [roadmaps, formData.excludeRoadmapCourses, setFormData]);

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
                            value: formData.instructor,
                            onChange: changeHandlerFactory('instructor'),
                            placeholder: 'Last name only',
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
                        label="Units"
                        textFieldProps={{
                            value: formData.units,
                            onChange: changeHandlerFactory('units'),
                            type: 'search',
                            placeholder: 'ex. 3, 4, or VAR',
                            fullWidth: true,
                        }}
                    />

                    <LabeledSelect
                        label="Class Full Option"
                        selectProps={{
                            value: formData.coursesFull,
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
                            value: formData.division,
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
                            value: formData.startTime ? parse(formData.startTime, 'HH:mm', new Date()) : null,
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
                            value: formData.endTime ? parse(formData.endTime, 'HH:mm', new Date()) : null,
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
                            value: formData.building === 'ON' ? 'true' : 'false',
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
                            value: formData.building,
                            onChange: changeHandlerFactory('building'),
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
                        label="Room"
                        textFieldProps={{
                            id: 'room',
                            type: 'search',
                            value: formData.room,
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
                            value: formData.excludeRoadmapCourses,
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
                            value: formData.excludeRestrictionCodes.split(''),
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
                                    checked={formData.excludeRestrictionCodes.includes(option.value)}
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
                            value: formData.days ? formData.days.split(/(?=[A-Z])/) : [],
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
                                    checked={formData.days.includes(option.value)}
                                    inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                                />
                                <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                            </MenuItem>
                        ))}
                    </LabeledSelect>
                </Box>
            </Box>
            <SignInDialog open={signInOpen} onClose={handleSignInClose} isDark={isDark} feature="Planner" />
        </>
    );
}

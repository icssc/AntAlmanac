import { SignInDialog } from '$components/dialogs/SignInDialog';
import {
    DAYS_OPTIONS,
    EXCLUDE_RESTRICTION_CODES_OPTIONS,
} from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { AdvancedSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import { CreateRoadmapLinkItem } from '$components/RightPane/CoursePane/SearchForm/CreateRoadmapLinkItem';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import { useAdvancedSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { usePlannerStore } from '$stores/PlannerStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box, Checkbox, ListItemText, MenuItem, type SelectChangeEvent, Tooltip, Typography } from '@mui/material';
import type { Roadmap } from '@packages/antalmanac-types';
import { format, isValid, parse } from 'date-fns';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
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
    const { advanced, setField, setAdvanced } = useAdvancedSearchParams();
    const { plannerRoadmaps, updateTakenCourses } = usePlannerStore(
        useShallow((s) => ({ plannerRoadmaps: s.plannerRoadmaps, updateTakenCourses: s.updateTakenCourses }))
    );
    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);
    const [signInOpen, setSignInOpen] = useState(false);

    const changeHandlerFactory = (name: AdvancedSearchParam | 'online') => (event: InputEvent) => {
        if (name === 'startTime' || name === 'endTime') {
            if (event instanceof Date || event === null) {
                const stringTime = event && isValid(event) ? format(event, 'HH:mm') : '';
                setField(name, stringTime);
                return;
            }
        }

        if (name === 'online') {
            const checked = (event as ChangeEvent<HTMLInputElement>).target.value === 'true';
            const nextBuilding = checked ? 'ON' : '';
            const nextRoom = checked ? 'LINE' : '';
            setAdvanced({ building: nextBuilding, room: nextRoom });
            return;
        }

        const value = (event as Exclude<InputEvent, Date | null>).target.value;
        const stringValue = Array.isArray(value) ? value.join('') : value;
        setField(name, stringValue);
    };

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    useEffect(() => {
        updateTakenCourses(advanced.excludeRoadmapCourses);

        if (!advanced.excludeRoadmapCourses) return;
        if (!plannerRoadmaps || plannerRoadmaps.length === 0) return;

        const exists = plannerRoadmaps.some((r) => r.id.toString() === advanced.excludeRoadmapCourses);

        if (!exists) {
            openSnackbar('warning', 'Invalid roadmap selection. All courses shown.');
            setField('excludeRoadmapCourses', '');
        }
    }, [advanced.excludeRoadmapCourses, plannerRoadmaps, setField, updateTakenCourses]);

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
                            value: advanced.instructor,
                            onChange: changeHandlerFactory('instructor'),
                            placeholder: 'Last name only',
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
                        label="Units"
                        textFieldProps={{
                            value: advanced.units,
                            onChange: changeHandlerFactory('units'),
                            type: 'search',
                            placeholder: 'ex. 4 or VAR',
                            fullWidth: true,
                        }}
                    />

                    <LabeledSelect
                        label="Class Full Option"
                        selectProps={{
                            value: advanced.coursesFull,
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
                            value: advanced.division,
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
                            value: advanced.startTime ? parse(advanced.startTime, 'HH:mm', new Date()) : null,
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
                            value: advanced.endTime ? parse(advanced.endTime, 'HH:mm', new Date()) : null,
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
                            value: advanced.building === 'ON' ? 'true' : 'false',
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
                            value: advanced.building,
                            onChange: changeHandlerFactory('building'),
                            fullWidth: true,
                        }}
                    />

                    <LabeledTextField
                        label="Room"
                        textFieldProps={{
                            id: 'room',
                            type: 'search',
                            value: advanced.room,
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
                            value: advanced.excludeRoadmapCourses,
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
                            value: advanced.excludeRestrictionCodes.split(''),
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
                                    checked={advanced.excludeRestrictionCodes.includes(option.value)}
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
                            value: advanced.days ? advanced.days.split(/(?=[A-Z])/) : [],
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
                                    checked={advanced.days.includes(option.value)}
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

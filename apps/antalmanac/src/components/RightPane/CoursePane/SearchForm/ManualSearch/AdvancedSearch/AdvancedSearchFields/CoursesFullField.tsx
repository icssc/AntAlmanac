import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { COURSES_FULL_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { MenuItem } from '@mui/material';
import { memo } from 'react';

export const CoursesFullField = memo(() => {
    const [coursesFull, setCoursesFull] = useCourseSearchParam('coursesFull');

    return (
        <LabeledSelect
            label="Class Full Option"
            selectProps={{
                value: coursesFull,
                onChange: (event) => setCoursesFull(event.target.value),
                sx: { width: '100%' },
            }}
        >
            {COURSES_FULL_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                    {label}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

CoursesFullField.displayName = 'CoursesFullField';

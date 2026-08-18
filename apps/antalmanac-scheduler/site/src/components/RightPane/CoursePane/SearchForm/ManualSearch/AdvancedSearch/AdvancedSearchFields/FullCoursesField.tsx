import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { FULL_COURSES_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { MenuItem } from '@mui/material';
import { memo } from 'react';

export const FullCoursesField = memo(() => {
    const [fullCourses, setFullCourses] = useCourseSearchParam('fullCourses');

    return (
        <LabeledSelect
            label="Courses Full Option"
            selectProps={{
                value: fullCourses,
                onChange: (event) => setFullCourses(event.target.value),
                sx: { width: '100%' },
            }}
        >
            {FULL_COURSES_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                    {label}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

FullCoursesField.displayName = 'FullCoursesField';

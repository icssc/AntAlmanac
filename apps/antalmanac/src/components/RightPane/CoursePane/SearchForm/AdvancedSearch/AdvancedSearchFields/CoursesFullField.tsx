import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
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
            <MenuItem value={'ANY'}>Include all classes</MenuItem>
            <MenuItem value={'SkipFullWaitlist'}>Include full courses if space on waitlist</MenuItem>
            <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
            <MenuItem value={'FullOnly'}>Show only full or waitlisted courses</MenuItem>
            <MenuItem value={'Overenrolled'}>Show only over-enrolled courses</MenuItem>
        </LabeledSelect>
    );
});

CoursesFullField.displayName = 'CoursesFullField';

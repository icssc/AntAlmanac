import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { memo } from 'react';

export const InstructorField = memo(() => {
    const [instructor, setInstructor] = useCourseSearchParam('instructor');

    return (
        <LabeledTextField
            label="Instructor"
            textFieldProps={{
                type: 'search',
                value: instructor,
                onChange: (event) => setInstructor(event.target.value),
                placeholder: 'Last name only',
                fullWidth: true,
            }}
        />
    );
});

InstructorField.displayName = 'InstructorField';

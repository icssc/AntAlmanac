import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { ChangeEvent } from 'react';

export function CourseNumberSearchBar() {
    const [courseNumber, setCourseNumber] = useCourseSearchParam('courseNumber');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        void setCourseNumber(event.target.value);
    };

    return (
        <LabeledTextField
            label="Course Number(s)"
            textFieldProps={{
                type: 'search',
                value: courseNumber,
                onChange: handleChange,
                placeholder: 'ex. 6B, 17, 30-40',
                fullWidth: true,
                sx: {
                    minWidth: 200,
                },
            }}
            isAligned={true}
        />
    );
}

import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { ChangeEvent } from 'react';

export function CourseNumberSearchBar() {
    const { formData, setField } = useCourseSearchUrlState();

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        void setField('courseNumber', event.target.value);
    };

    return (
        <LabeledTextField
            label="Course Number(s)"
            textFieldProps={{
                type: 'search',
                value: formData.courseNumber,
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

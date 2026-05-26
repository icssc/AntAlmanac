import {
    selectFormField,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/courseSearchUrlState';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { ChangeEvent } from 'react';

export function CourseNumberSearchBar() {
    const courseNumber = useCourseSearchUrlState(selectFormField('courseNumber'));
    const setField = useCourseSearchUrlState((state) => state.setField);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        void setField('courseNumber', event.target.value);
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

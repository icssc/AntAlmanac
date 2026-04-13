import { useQueryState } from 'nuqs';
import { ChangeEvent } from 'react';

import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { searchParsers } from '$lib/searchParams';

export function CourseNumberSearchBar() {
    const [courseNumber, setCourseNumber] = useQueryState('courseNumber', searchParsers.courseNumber);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCourseNumber(event.target.value);
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

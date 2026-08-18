import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { memo, type ChangeEvent } from 'react';

export const SectionCodeField = memo(() => {
    const [sectionCode, setSectionCode] = useCourseSearchParam('sectionCode');

    const handleChange = (event: ChangeEvent<{ value: string }>) => {
        setSectionCode(event.target.value);
    };

    return (
        <LabeledTextField
            label="Section Code"
            textFieldProps={{
                value: sectionCode,
                onChange: handleChange,
                type: 'search',
                placeholder: 'ex. 14200, 29000-29100',
                fullWidth: true,
            }}
            isAligned={true}
        />
    );
});

SectionCodeField.displayName = 'SectionCodeField';

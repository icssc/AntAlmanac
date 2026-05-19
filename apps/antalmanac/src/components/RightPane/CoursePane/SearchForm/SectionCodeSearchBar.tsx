import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { ChangeEvent } from 'react';

const SectionCodeSearchBar = () => {
    const { formData, setField } = useCourseSearchUrlState();

    const handleChange = (event: ChangeEvent<{ value: string }>) => {
        void setField('sectionCode', event.target.value);
    };

    return (
        <LabeledTextField
            label="Section Code"
            textFieldProps={{
                value: formData.sectionCode,
                onChange: handleChange,
                type: 'search',
                placeholder: 'ex. 14200, 29000-29100',
                fullWidth: true,
            }}
            isAligned={true}
        />
    );
};

export default SectionCodeSearchBar;

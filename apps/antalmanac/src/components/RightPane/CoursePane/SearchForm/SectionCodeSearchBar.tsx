import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { ChangeEvent } from 'react';

const SectionCodeSearchBar = () => {
    const [sectionCode, setSectionCode] = useCourseSearchParam('sectionCode');

    const handleChange = (event: ChangeEvent<{ value: string }>) => {
        void setSectionCode(event.target.value);
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
};

export default SectionCodeSearchBar;

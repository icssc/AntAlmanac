import {
    selectFormField,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/courseSearchUrlState';
import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { ChangeEvent } from 'react';

const SectionCodeSearchBar = () => {
    const sectionCode = useCourseSearchUrlState(selectFormField('sectionCode'));
    const setField = useCourseSearchUrlState((state) => state.setField);

    const handleChange = (event: ChangeEvent<{ value: string }>) => {
        void setField('sectionCode', event.target.value);
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

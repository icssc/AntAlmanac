import { useQueryState } from 'nuqs';
import { ChangeEvent } from 'react';

import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { searchParsers } from '$lib/searchParams';

const SectionCodeSearchBar = () => {
    const [sectionCode, setSectionCode] = useQueryState('sectionCode', searchParsers.sectionCode);

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
};

export default SectionCodeSearchBar;

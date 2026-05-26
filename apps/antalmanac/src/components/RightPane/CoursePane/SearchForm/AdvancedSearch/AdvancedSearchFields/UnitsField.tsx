import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { memo } from 'react';

export const UnitsField = memo(() => {
    const [units, setUnits] = useCourseSearchParam('units');

    return (
        <LabeledTextField
            label="Units"
            textFieldProps={{
                value: units,
                onChange: (event) => setUnits(event.target.value),
                type: 'search',
                placeholder: 'ex. 4 or VAR',
                fullWidth: true,
            }}
        />
    );
});

UnitsField.displayName = 'UnitsField';

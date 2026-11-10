import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { memo } from 'react';

export const UnitsField = memo(() => {
    const [units, setUnits] = useCourseSearchParam('units');

    return (
        <LabeledTextField
            label="Units"
            textFieldProps={{
                value: units,
                onChange: (event) => {
                    const upper = event.target.value.toUpperCase();

                    if (upper.startsWith('VAR')) {
                        setUnits('VAR');
                    } else if ('VAR'.startsWith(upper)) {
                        setUnits(upper);
                    } else {
                        setUnits(upper.replace(/[^0-9.]/g, ''));
                    }
                },
                type: 'search',
                placeholder: 'ex. 4 or VAR',
                fullWidth: true,
            }}
        />
    );
});

UnitsField.displayName = 'UnitsField';

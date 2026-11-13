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
                    const sanitized = upper.replace(/[^0-9.VAR]/g, '');
                    const varPrefix = sanitized.match(/^V(?:AR?)?/)?.[0];

                    if (varPrefix) {
                        setUnits(varPrefix);
                    } else {
                        const parts = upper.replace(/[^0-9.]/g, '').split('.');
                        const whole = parts[0];
                        const decimals = parts.slice(1);
                        const finalValue = decimals.length > 0 ? `${whole}.${decimals.join('')}` : whole;
                        setUnits(finalValue);
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

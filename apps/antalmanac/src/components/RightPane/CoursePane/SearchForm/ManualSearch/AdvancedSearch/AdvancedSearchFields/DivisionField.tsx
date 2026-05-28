import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { DIVISION_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { MenuItem } from '@mui/material';
import { memo } from 'react';

export const DivisionField = memo(() => {
    const [division, setDivision] = useCourseSearchParam('division');

    return (
        <LabeledSelect
            label="Course Level"
            selectProps={{
                value: division,
                onChange: (event) => setDivision(event.target.value),
                MenuProps: {
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                },
                sx: { width: '100%' },
            }}
        >
            {DIVISION_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                    {label}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

DivisionField.displayName = 'DivisionField';

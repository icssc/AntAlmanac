import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
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
                displayEmpty: true,
                MenuProps: {
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                },
                sx: { width: '100%' },
            }}
        >
            <MenuItem value={''}>Any Division</MenuItem>
            <MenuItem value={'LowerDiv'}>Lower Division</MenuItem>
            <MenuItem value={'UpperDiv'}>Upper Division</MenuItem>
            <MenuItem value={'Graduate'}>Graduate/Professional</MenuItem>
        </LabeledSelect>
    );
});

DivisionField.displayName = 'DivisionField';

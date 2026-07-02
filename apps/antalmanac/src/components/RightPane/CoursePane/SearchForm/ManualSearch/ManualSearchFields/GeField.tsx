import {
    ANY_GE,
    ANY_GE_LABEL,
    GE_OPTIONS,
    getGeLabel,
    getGeShortLabel,
    isGeOption,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { memo } from 'react';

export const GeField = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = typeof value === 'string' ? value.split(',') : value;

        // Picking "Any GEs" clears the filter; otherwise keep the valid GE codes.
        setGe(values.includes(ANY_GE) ? [] : values.filter(isGeOption));
    };

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                multiple: true,
                displayEmpty: true,
                value: ge,
                onChange: handleChange,
                renderValue: (selected) => {
                    const values = selected as typeof ge;
                    if (values.length === 0) return ANY_GE_LABEL;
                    if (values.length === 1) return getGeLabel(values[0]);
                    return values.map(getGeShortLabel).join(' and ');
                },
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            <MenuItem value={ANY_GE} sx={{ paddingY: 0.25 }}>
                <Checkbox checked={ge.length === 0} size="small" />
                <ListItemText primary={ANY_GE_LABEL} />
            </MenuItem>
            {GE_OPTIONS.map((category) => (
                <MenuItem key={category.value} value={category.value} sx={{ paddingY: 0.25 }}>
                    <Checkbox checked={ge.includes(category.value)} size="small" />
                    <ListItemText primary={category.label} />
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

GeField.displayName = 'GeField';

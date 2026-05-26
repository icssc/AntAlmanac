import { DAYS_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { memo } from 'react';

export const DaysField = memo(() => {
    const [days, setDays] = useCourseSearchParam('days');

    return (
        <LabeledSelect
            label="Days"
            selectProps={{
                multiple: true,
                value: days ? days.split(/(?=[A-Z])/) : [],
                onChange: (event: SelectChangeEvent<string | string[]>) => {
                    const value = event.target.value;
                    setDays(Array.isArray(value) ? value.join('') : value);
                },
                renderValue: (selected) =>
                    (selected as string[])
                        .sort((a, b) => {
                            const orderA = DAYS_OPTIONS.findIndex((day) => day.value === a);
                            const orderB = DAYS_OPTIONS.findIndex((day) => day.value === b);
                            return orderA - orderB;
                        })
                        .join(', '),
                sx: { width: '100%' },
            }}
        >
            {DAYS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ paddingY: 0.25 }}>
                    <Checkbox
                        checked={days.includes(option.value)}
                        inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                    />
                    <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

DaysField.displayName = 'DaysField';

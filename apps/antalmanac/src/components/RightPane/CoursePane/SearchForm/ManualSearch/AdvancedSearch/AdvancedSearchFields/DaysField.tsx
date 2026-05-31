import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { DAYS_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import type { WebsocDayOption } from '@packages/antalmanac-types';
import { memo } from 'react';

export const DaysField = memo(() => {
    const [days, setDays] = useCourseSearchParam('days');

    return (
        <LabeledSelect<WebsocDayOption[]>
            label="Days"
            selectProps={{
                multiple: true,
                value: days,
                onChange: (event: SelectChangeEvent<WebsocDayOption[]>) => {
                    const { value } = event.target;
                    if (Array.isArray(value)) {
                        setDays(
                            value.sort(
                                (a, b) =>
                                    DAYS_OPTIONS.findIndex((day) => day.value === a) -
                                    DAYS_OPTIONS.findIndex((day) => day.value === b)
                            )
                        );
                    }
                },
                renderValue: (selected) => selected.join(', '),
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

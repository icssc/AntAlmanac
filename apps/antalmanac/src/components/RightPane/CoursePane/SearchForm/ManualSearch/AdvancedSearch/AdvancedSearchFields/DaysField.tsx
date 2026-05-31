import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { DAYS_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { parseDaysString } from '$stores/calendarizeHelpers';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import type { WebsocDayOption } from '@packages/antalmanac-types';
import { WEBSOC_DAYS } from '@packages/antalmanac-types';
import { memo } from 'react';

function sortWebsocDays(days: WebsocDayOption[]): WebsocDayOption[] {
    return [...days].sort((a, b) => WEBSOC_DAYS.indexOf(a) - WEBSOC_DAYS.indexOf(b));
}

export const DaysField = memo(() => {
    const [days, setDays] = useCourseSearchParam('days');

    return (
        <LabeledSelect<WebsocDayOption[]>
            label="Days"
            selectProps={{
                multiple: true,
                value: days,
                onChange: (event: SelectChangeEvent<WebsocDayOption | WebsocDayOption[]>) => {
                    const { value } = event.target;
                    if (Array.isArray(value)) {
                        setDays(sortWebsocDays(value));
                    } else if (typeof value === 'string') {
                        const indices = parseDaysString(value);
                        setDays(sortWebsocDays((indices ?? []).map((index) => WEBSOC_DAYS[index])));
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

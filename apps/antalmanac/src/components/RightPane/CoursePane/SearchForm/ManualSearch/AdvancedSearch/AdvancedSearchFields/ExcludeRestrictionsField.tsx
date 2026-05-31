import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { EXCLUDE_RESTRICTION_CODES_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/ManualSearch/AdvancedSearch/constants';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { parseExcludeRestrictionCodeSelection } from '$components/RightPane/CoursePane/SearchParams/restrictionCodeParser';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { memo } from 'react';

export const ExcludeRestrictionsField = memo(() => {
    const [excludeRestrictionCodes, setExcludeRestrictionCodes] = useCourseSearchParam('excludeRestrictionCodes');

    return (
        <LabeledSelect
            label="Exclude Restrictions"
            selectProps={{
                multiple: true,
                value: excludeRestrictionCodes,
                onChange: (event: SelectChangeEvent<string | string[]>) => {
                    const value = event.target.value;
                    setExcludeRestrictionCodes(parseExcludeRestrictionCodeSelection(value));
                },
                renderValue: (selected) => (Array.isArray(selected) ? selected : []).join(', '),
                sx: { width: '100%' },
            }}
        >
            {EXCLUDE_RESTRICTION_CODES_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ paddingY: 0.25 }}>
                    <Checkbox
                        checked={excludeRestrictionCodes.includes(option.value)}
                        inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                    />
                    <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

ExcludeRestrictionsField.displayName = 'ExcludeRestrictionsField';

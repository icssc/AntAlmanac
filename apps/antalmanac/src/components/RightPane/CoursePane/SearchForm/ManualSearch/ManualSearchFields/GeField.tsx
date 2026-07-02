import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import type { WebsocGeOption } from '@packages/antalmanac-types';
import { memo } from 'react';

const GE_OPTIONS = [
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing', shortLabel: 'GE Ia (1a)' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing', shortLabel: 'GE Ib (1b)' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology', shortLabel: 'GE II (2)' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences', shortLabel: 'GE III (3)' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities', shortLabel: 'GE IV (4)' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy', shortLabel: 'GE Va (5a)' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning', shortLabel: 'GE Vb (5b)' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English', shortLabel: 'GE VI (6)' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies', shortLabel: 'GE VII (7)' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues', shortLabel: 'GE VIII (8)' },
] as const satisfies readonly { value: WebsocGeOption; label: string; shortLabel: string }[];

const GE_OPTION_BY_VALUE = new Map(GE_OPTIONS.map((option) => [option.value, option]));

const EMPTY_GE_LABEL = "ANY: Don't filter for GE";

const renderGeValue = (selected: WebsocGeOption[]) => {
    if (selected.length === 0) return EMPTY_GE_LABEL;
    if (selected.length === 1) return GE_OPTION_BY_VALUE.get(selected[0])?.label ?? selected[0];
    return selected.map((value) => GE_OPTION_BY_VALUE.get(value)?.shortLabel ?? value).join(' and ');
};

export const GeField = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    return (
        <LabeledSelect<WebsocGeOption[]>
            label="General Education"
            selectProps={{
                multiple: true,
                displayEmpty: true,
                value: ge,
                onChange: (event: SelectChangeEvent<WebsocGeOption[]>) => {
                    const { value } = event.target;
                    if (Array.isArray(value)) {
                        setGe(value);
                    }
                },
                renderValue: renderGeValue,
                sx: { width: '100%' },
            }}
            isAligned={true}
        >
            {GE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ paddingY: 0.25 }}>
                    <Checkbox
                        checked={ge.includes(option.value)}
                        inputProps={{ 'aria-labelledby': `option-label-${option.value}` }}
                    />
                    <ListItemText id={`option-label-${option.value}`} primary={option.label} />
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

GeField.displayName = 'GeField';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import type { WebsocGeOption } from '@packages/antalmanac-types';
import { memo } from 'react';

const GE_OPTIONS = [
    { value: 'GE-1A', label: 'GE Ia (1a): Lower Division Writing' },
    { value: 'GE-1B', label: 'GE Ib (1b): Upper Division Writing' },
    { value: 'GE-2', label: 'GE II (2): Science and Technology' },
    { value: 'GE-3', label: 'GE III (3): Social and Behavioral Sciences' },
    { value: 'GE-4', label: 'GE IV (4): Arts and Humanities' },
    { value: 'GE-5A', label: 'GE Va (5a): Quantitative Literacy' },
    { value: 'GE-5B', label: 'GE Vb (5b): Formal Reasoning' },
    { value: 'GE-6', label: 'GE VI (6): Language other than English' },
    { value: 'GE-7', label: 'GE VII (7): Multicultural Studies' },
    { value: 'GE-8', label: 'GE VIII (8): International/Global Issues' },
] as const satisfies readonly { value: WebsocGeOption; label: string }[];

export const GeField = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    return (
        <LabeledSelect<WebsocGeOption[]>
            label="General Education"
            selectProps={{
                multiple: true,
                value: ge,
                onChange: (event: SelectChangeEvent<WebsocGeOption[]>) => {
                    const { value } = event.target;
                    if (Array.isArray(value)) {
                        setGe(value);
                    }
                },
                renderValue: (selected) => selected.join(', '),
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

import { GE_OPTIONS, type GeValue } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { memo } from 'react';

const ANY_GE = GE_OPTIONS[0].value;

const getLabel = (value: string) => GE_OPTIONS.find((ge) => ge.value === value)?.label ?? value;
const getShortLabel = (value: string) => GE_OPTIONS.find((ge) => ge.value === value)?.shortLabel ?? value;

export const GeSelector = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = typeof value === 'string' ? value.split(',') : value;
        const selectedValues = values.includes(ANY_GE)
            ? []
            : values.filter((currentValue): currentValue is GeValue => currentValue !== ANY_GE);
        setGe(selectedValues);
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
                    const values = selected as GeValue[];
                    if (values.length === 0) return getLabel(ANY_GE);
                    if (values.length === 1) return getLabel(values[0]);
                    return values.map((value) => getShortLabel(value)).join(' and ');
                },
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {GE_OPTIONS.map((category) => {
                const isChecked = category.value === ANY_GE ? ge.length === 0 : ge.includes(category.value);

                return (
                    <MenuItem key={category.value} value={category.value} sx={{ paddingY: 0.25 }}>
                        <Checkbox checked={isChecked} size="small" />
                        <ListItemText primary={category.label} />
                    </MenuItem>
                );
            })}
        </LabeledSelect>
    );
});

GeSelector.displayName = 'GeSelector';

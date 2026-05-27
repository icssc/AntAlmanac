import { ANY_GE_OPTION, GE_OPTIONS } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { GeSearchValueSchema } from '@packages/antalmanac-types';
import { memo } from 'react';

const getLabel = (value: string) => GE_OPTIONS.find((ge) => ge.value === value)?.label ?? value;
const getShortLabel = (value: string) => GE_OPTIONS.find((ge) => ge.value === value)?.shortLabel ?? value;

export const GeSelector = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = typeof value === 'string' ? value.split(',') : value;
        if (values.includes(ANY_GE_OPTION.value)) {
            setGe([]);
            return;
        }

        setGe(
            values.flatMap((currentValue) => {
                const parsed = GeSearchValueSchema.safeParse(currentValue);
                return parsed.success ? [parsed.data] : [];
            })
        );
    };

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                multiple: true,
                displayEmpty: true,
                value: ge,
                onChange: handleChange,
                renderValue: () => {
                    if (ge.length === 0) return getLabel(ANY_GE_OPTION.value);
                    if (ge.length === 1) return getLabel(ge[0]);
                    return ge.map((value) => getShortLabel(value)).join(' and ');
                },
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {GE_OPTIONS.map((category) => {
                const isChecked =
                    category.value === ANY_GE_OPTION.value ? ge.length === 0 : ge.includes(category.value);

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

import { GE_LABELS } from '$components/RightPane/CoursePane/SearchForm/AdvancedSearch/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { WebsocGeSchema } from '@packages/antalmanac-types';
import { memo } from 'react';

export const GeSelector = memo(() => {
    const [ge, setGe] = useCourseSearchParam('ge');

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = typeof value === 'string' ? value.split(',') : value;
        if (values.includes('ANY')) {
            setGe(['ANY']);
            return;
        }

        setGe(
            values.flatMap((currentValue) => {
                const parsed = WebsocGeSchema.safeParse(currentValue);
                return parsed.success && parsed.data !== 'ANY' ? [parsed.data] : [];
            })
        );
    };

    const renderValue = () => {
        if (ge.includes('ANY')) {
            return GE_LABELS.ANY.label;
        }

        if (ge.length === 1) {
            return GE_LABELS[ge[0]].label;
        }

        return ge.map((value) => GE_LABELS[value].shortLabel).join(', ');
    };

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                multiple: true,
                displayEmpty: true,
                value: ge,
                onChange: handleChange,
                renderValue: renderValue,
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {WebsocGeSchema.options.map((value) => (
                <MenuItem key={value} value={value} sx={{ paddingY: 0.25 }}>
                    <Checkbox checked={ge.includes(value)} size="small" />
                    <ListItemText primary={GE_LABELS[value].label} />
                </MenuItem>
            ))}
        </LabeledSelect>
    );
});

GeSelector.displayName = 'GeSelector';

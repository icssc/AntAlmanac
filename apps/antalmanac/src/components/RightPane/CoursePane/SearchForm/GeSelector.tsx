import {
    ANY_GE,
    GE_LIST,
    getSelectedGEs,
    normalizeGeSelection,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';

const getLabel = (value: string) => GE_LIST.find((ge) => ge.value === value)?.label ?? value;
const getShortLabel = (value: string) => GE_LIST.find((ge) => ge.value === value)?.shortLabel ?? value;

export function GeSelector() {
    const { formData, setField } = useCourseSearchUrlState();
    const selectedGEs = getSelectedGEs(formData.ge);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = (typeof value === 'string' ? value.split(',') : value).filter(Boolean);
        const selectedValues = values.includes(ANY_GE) ? [] : values.filter((currentValue) => currentValue !== ANY_GE);
        const searchValue = normalizeGeSelection(selectedValues.join(','));

        void setField('ge', searchValue);
    };

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                multiple: true,
                displayEmpty: true,
                value: selectedGEs,
                onChange: handleChange,
                renderValue: (selected) => {
                    const values = selected as string[];
                    if (values.length === 0) return ANY_GE;
                    if (values.length === 1) return getLabel(values[0]);
                    return values.map((value) => getShortLabel(value)).join(' and ');
                },
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {GE_LIST.map((category) => {
                const isChecked =
                    category.value === ANY_GE ? selectedGEs.length === 0 : selectedGEs.includes(category.value);

                return (
                    <MenuItem key={category.value} value={category.value} sx={{ paddingY: 0.25 }}>
                        <Checkbox checked={isChecked} size="small" />
                        <ListItemText primary={category.label} />
                    </MenuItem>
                );
            })}
        </LabeledSelect>
    );
}

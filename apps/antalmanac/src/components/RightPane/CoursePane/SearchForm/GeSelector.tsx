import {
    ANY_GE,
    GE_DISPLAY_DELIMITER,
    GE_LIST,
    getSelectedGEs,
    normalizeGeSelection,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { replaceUrlSearchParams } from '$lib/utils';
import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';

const getLabel = (value: string) => GE_LIST.find((ge) => ge.value === value)?.label ?? value;
const getShortLabel = (value: string) => GE_LIST.find((ge) => ge.value === value)?.shortLabel ?? value;

export function GeSelector() {
    const [ge, setGe] = useState(() => RightPaneStore.getFormData().ge);
    const selectedGEs = getSelectedGEs(ge);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const values = (typeof value === 'string' ? value.split(',') : value).filter(Boolean);
        const selectedValues = values.includes(ANY_GE) ? [] : values.filter((currentValue) => currentValue !== ANY_GE);
        const searchValue = normalizeGeSelection(selectedValues.join(','));

        setGe(searchValue);
        RightPaneStore.updateFormValue('ge', searchValue);

        replaceUrlSearchParams((params) => {
            params.delete('ge');
            if (searchValue !== ANY_GE) {
                params.set('ge', searchValue);
            }
        });
    };

    const resetField = useCallback(() => {
        setGe(normalizeGeSelection(RightPaneStore.getFormData().ge));
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

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
                    if (values.length === 0) return getLabel(ANY_GE);
                    if (values.length === 1) return getLabel(values[0]);
                    return values.map((value) => getShortLabel(value)).join(GE_DISPLAY_DELIMITER);
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

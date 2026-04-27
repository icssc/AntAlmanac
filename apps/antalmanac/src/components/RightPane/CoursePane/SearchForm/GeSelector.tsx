import { Checkbox, ListItemText, MenuItem, type SelectChangeEvent } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getSelectedGEs, normalizeGeSelection } from '$lib/multiGeSearch';

const GE_LIST = [
    { value: 'ANY', label: "All: Don't filter for GE" },
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
] as const;

const ANY_GE = GE_LIST[0].value;
const getLabel = (value: string) => GE_LIST.find((ge) => ge.value === value)?.label ?? value;

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

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);

        urlParam.delete('ge');

        if (searchValue !== ANY_GE) {
            urlParam.append('ge', searchValue);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
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
                    return values.map((value) => getLabel(value).split(':')[0].trim()).join(' + ');
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

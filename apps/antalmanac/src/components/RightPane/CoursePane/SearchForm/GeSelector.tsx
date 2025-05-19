import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';

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

export function GeSelector() {
    const [ge, setGe] = useState(() => RightPaneStore.getFormData().ge);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;

        setGe(value);
        RightPaneStore.updateFormValue('ge', value);

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);

        urlParam.delete('ge');

        if (value !== 'ANY') {
            urlParam.append('ge', value);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    };

    const resetField = useCallback(() => {
        setGe(RightPaneStore.getFormData().term);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <FormControl sx={{ flexGrow: 1, width: '50%' }}>
            <InputLabel variant="standard">General Education</InputLabel>
            <Select
                value={ge}
                onChange={handleChange}
                fullWidth
                MenuProps={{
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                }}
                variant="standard"
            >
                {GE_LIST.map((category) => {
                    return (
                        <MenuItem key={category.value} value={category.value}>
                            {category.label}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
